import { randomUUID } from "node:crypto";

import { PaymentStatus, Prisma, SubscriptionStatus } from "@/generated/prisma/client";
import { getAppUrl } from "@/lib/env";
import { getPreferenceClient } from "@/lib/mercado-pago";
import { getPlanBySlug } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

type MercadoPagoPaymentLike = {
  id?: number | string;
  status?: string;
  status_detail?: string | null;
  transaction_amount?: number | null;
  currency_id?: string | null;
  external_reference?: string | null;
  date_approved?: string | null;
  payment_method_id?: string | null;
  payment_type_id?: string | null;
  metadata?: Record<string, unknown> | null;
};

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function getMetadataString(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toString();
  }

  return null;
}

function sanitizeMercadoPagoPayment(payment: MercadoPagoPaymentLike) {
  const metadata = payment.metadata ?? {};

  return toJson({
    provider: "mercadopago",
    payment_id: payment.id?.toString() ?? null,
    status: payment.status ?? null,
    status_detail: payment.status_detail ?? null,
    transaction_amount: payment.transaction_amount ?? null,
    currency_id: payment.currency_id ?? null,
    external_reference: payment.external_reference ?? null,
    date_approved: payment.date_approved ?? null,
    payment_method_id: payment.payment_method_id ?? null,
    payment_type_id: payment.payment_type_id ?? null,
    metadata: {
      payment_id: getMetadataString(metadata, "payment_id"),
      plan_id: getMetadataString(metadata, "plan_id"),
      user_id: getMetadataString(metadata, "user_id"),
    },
  });
}

function validateApprovedPaymentConsistency(input: {
  mercadoPagoPayment: MercadoPagoPaymentLike;
  mercadoPagoPaymentId: string;
  payment: {
    id: string;
    userId: string;
    planId: string;
    mercadoPagoPaymentId: string | null;
    amountCents: number;
    currency: string;
    plan: {
      priceCents: number;
      currency: string;
    };
  };
}) {
  const { mercadoPagoPayment, mercadoPagoPaymentId, payment } = input;
  const metadata = mercadoPagoPayment.metadata ?? {};
  const reasons: string[] = [];
  const metadataUserId = getMetadataString(metadata, "user_id");
  const metadataPlanId = getMetadataString(metadata, "plan_id");
  const metadataPaymentId = getMetadataString(metadata, "payment_id");
  const expectedCurrency = payment.plan.currency || payment.currency;
  const approvedAmountCents =
    typeof mercadoPagoPayment.transaction_amount === "number"
      ? Math.round(mercadoPagoPayment.transaction_amount * 100)
      : null;

  if (metadataUserId !== payment.userId) {
    reasons.push("metadata.user_id divergente");
  }

  if (metadataPlanId !== payment.planId) {
    reasons.push("metadata.plan_id divergente");
  }

  if (metadataPaymentId !== payment.id) {
    reasons.push("metadata.payment_id divergente");
  }

  if (mercadoPagoPayment.external_reference !== payment.id) {
    reasons.push("external_reference divergente");
  }

  if (
    approvedAmountCents !== payment.plan.priceCents ||
    approvedAmountCents !== payment.amountCents
  ) {
    reasons.push("valor aprovado divergente");
  }

  if ((mercadoPagoPayment.currency_id ?? "").toUpperCase() !== expectedCurrency.toUpperCase()) {
    reasons.push("moeda divergente");
  }

  if (payment.mercadoPagoPaymentId && payment.mercadoPagoPaymentId !== mercadoPagoPaymentId) {
    reasons.push("mercadoPagoPaymentId divergente");
  }

  return {
    isValid: reasons.length === 0,
    reasons,
  };
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
  const metadataPaymentId = getMetadataString(input.mercadoPagoPayment.metadata, "payment_id");
  const localPaymentId = input.mercadoPagoPayment.external_reference ?? metadataPaymentId;

  if (!mercadoPagoPaymentId) {
    throw new Error("Pagamento do Mercado Pago sem identificador.");
  }

  const status = mapMercadoPagoStatus(input.mercadoPagoPayment.status);
  const sanitizedPayload = sanitizeMercadoPagoPayment(input.mercadoPagoPayment);

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

    if (status === PaymentStatus.APPROVED) {
      const consistency = validateApprovedPaymentConsistency({
        mercadoPagoPayment: input.mercadoPagoPayment,
        mercadoPagoPaymentId,
        payment,
      });

      if (!consistency.isValid) {
        console.warn("Mercado Pago payment consistency check failed", {
          paymentId: payment.id,
          mercadoPagoPaymentId,
          reasons: consistency.reasons,
        });

        const inconsistentPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            ...(payment.mercadoPagoPaymentId ? {} : { mercadoPagoPaymentId }),
            status: PaymentStatus.UNKNOWN,
            rawPayload: sanitizedPayload,
          },
          include: { plan: true },
        });

        await tx.webhookEvent.update({
          where: { id: input.webhookEventId },
          data: {
            processed: true,
            processedAt: new Date(),
            error: `Pagamento inconsistente: ${consistency.reasons.join("; ")}`,
          },
        });

        return inconsistentPayment;
      }
    }

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        mercadoPagoPaymentId,
        status,
        rawPayload: sanitizedPayload,
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
