import { randomUUID } from "node:crypto";

import { PaymentStatus, Prisma, SubscriptionStatus } from "@/generated/prisma/client";
import { getAppUrl } from "@/lib/env";
import { getPreferenceClient } from "@/lib/mercado-pago";
import { getPlanBySlug } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

type MercadoPagoPaymentLike = {
  id?: number | string;
  status?: string;
  external_reference?: string | null;
  metadata?: Record<string, unknown> | null;
};

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function mapMercadoPagoStatus(status: string | undefined): PaymentStatus {
  switch (status) {
    case "approved":
      return PaymentStatus.APPROVED;
    case "rejected":
      return PaymentStatus.REJECTED;
    case "cancelled":
    case "canceled":
      return PaymentStatus.CANCELLED;
    case "refunded":
      return PaymentStatus.REFUNDED;
    case "in_process":
      return PaymentStatus.IN_PROCESS;
    case "pending":
      return PaymentStatus.PENDING;
    default:
      return PaymentStatus.UNKNOWN;
  }
}

export async function createCheckoutForPlan(input: { userId: string; planSlug: string }) {
  const [user, plan] = await Promise.all([
    prisma.user.findUnique({ where: { id: input.userId } }),
    getPlanBySlug(input.planSlug),
  ]);

  if (!user) {
    throw new Error("Usuario nao encontrado.");
  }

  if (!plan) {
    throw new Error("Plano nao encontrado.");
  }

  if (plan.priceCents <= 0) {
    throw new Error("O plano gratuito nao precisa de checkout.");
  }

  const appUrl = getAppUrl();
  const localPaymentId = randomUUID();
  const preference = await getPreferenceClient().create({
    body: {
      items: [
        {
          id: plan.id,
          title: `PayFlow ${plan.name}`,
          description: plan.description,
          quantity: 1,
          currency_id: plan.currency,
          unit_price: plan.priceCents / 100,
        },
      ],
      payer: {
        name: user.name,
        email: user.email,
      },
      external_reference: localPaymentId,
      metadata: {
        payment_id: localPaymentId,
        plan_id: plan.id,
        user_id: user.id,
      },
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${appUrl}/checkout/success`,
        failure: `${appUrl}/checkout/failure`,
        pending: `${appUrl}/checkout/pending`,
      },
      auto_return: "approved",
    },
    requestOptions: {
      idempotencyKey: localPaymentId,
    },
  });

  const checkoutUrl = preference.init_point ?? preference.sandbox_init_point;

  if (!preference.id || !checkoutUrl) {
    throw new Error("Mercado Pago nao retornou dados suficientes para iniciar o checkout.");
  }

  await prisma.payment.create({
    data: {
      id: localPaymentId,
      userId: user.id,
      planId: plan.id,
      mercadoPagoPreferenceId: preference.id,
      mercadoPagoCheckoutUrl: preference.init_point,
      mercadoPagoSandboxInitUrl: preference.sandbox_init_point,
      status: PaymentStatus.PENDING,
      amountCents: plan.priceCents,
      currency: plan.currency,
    },
  });

  return {
    paymentId: localPaymentId,
    preferenceId: preference.id,
    checkoutUrl,
  };
}

export async function applyMercadoPagoPaymentUpdate(input: {
  mercadoPagoPayment: MercadoPagoPaymentLike;
  webhookEventId: string;
}) {
  const mercadoPagoPaymentId = input.mercadoPagoPayment.id?.toString();
  const localPaymentId =
    input.mercadoPagoPayment.external_reference ??
    (typeof input.mercadoPagoPayment.metadata?.payment_id === "string"
      ? input.mercadoPagoPayment.metadata.payment_id
      : null);

  if (!mercadoPagoPaymentId) {
    throw new Error("Pagamento do Mercado Pago sem identificador.");
  }

  const status = mapMercadoPagoStatus(input.mercadoPagoPayment.status);

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: {
        OR: [...(localPaymentId ? [{ id: localPaymentId }] : []), { mercadoPagoPaymentId }],
      },
      include: { plan: true },
    });

    if (!payment) {
      throw new Error("Pagamento local nao encontrado para a notificacao.");
    }

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        mercadoPagoPaymentId,
        status,
        rawPayload: toJson(input.mercadoPagoPayment),
      },
      include: { plan: true },
    });

    if (status === PaymentStatus.APPROVED) {
      await tx.subscription.upsert({
        where: { userId: payment.userId },
        update: {
          planId: payment.planId,
          status: SubscriptionStatus.ACTIVE,
          startsAt: new Date(),
          endsAt: null,
        },
        create: {
          userId: payment.userId,
          planId: payment.planId,
          status: SubscriptionStatus.ACTIVE,
          startsAt: new Date(),
        },
      });
    }

    await tx.webhookEvent.update({
      where: { id: input.webhookEventId },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    return updatedPayment;
  });
}
