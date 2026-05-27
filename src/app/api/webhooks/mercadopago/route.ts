import { NextRequest } from "next/server";

import { apiError, ok } from "@/lib/api";
import { fetchMercadoPagoPayment, validateMercadoPagoSignature } from "@/lib/mercado-pago";
import { applyMercadoPagoPaymentUpdate } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MERCADO_PAGO_PROVIDER = "mercadopago";

type WebhookPayload = {
  id?: string | number;
  type?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
};

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function getEventType(payload: WebhookPayload) {
  return payload.action ?? payload.type ?? "unknown";
}

function isPaymentEvent(payload: WebhookPayload, queryType: string | null) {
  const eventType = getEventType(payload);
  return queryType === "payment" || payload.type === "payment" || eventType.startsWith("payment.");
}

function buildWebhookEventKey(input: {
  payload: WebhookPayload;
  dataId: string;
  eventType: string;
  requestId: string | null;
}) {
  const providerEventId = input.payload.id?.toString();

  if (providerEventId) {
    return `${input.eventType}:${input.dataId}:event:${providerEventId}`;
  }

  if (input.requestId) {
    return `${input.eventType}:${input.dataId}:request:${input.requestId}`;
  }

  // Valid signed requests should include x-request-id; reject if no stable key can be built.
  return null;
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as WebhookPayload;
  const queryDataId = request.nextUrl.searchParams.get("data.id");
  const queryType = request.nextUrl.searchParams.get("type");
  const dataId = queryDataId ?? payload.data?.id?.toString() ?? null;
  const requestId = request.headers.get("x-request-id");
  const signature = request.headers.get("x-signature");

  const isValidSignature = validateMercadoPagoSignature({
    dataId,
    requestId,
    signature,
  });

  if (!isValidSignature) {
    return apiError("Assinatura do webhook invalida.", 401);
  }

  if (!dataId) {
    return apiError("Webhook sem identificador de pagamento.", 422);
  }

  const eventType = getEventType(payload);
  const externalEventId = buildWebhookEventKey({
    payload,
    dataId,
    eventType,
    requestId,
  });

  if (!externalEventId) {
    return apiError("Webhook sem chave de idempotencia.", 422);
  }

  let webhookEvent;

  try {
    webhookEvent = await prisma.webhookEvent.create({
      data: {
        provider: MERCADO_PAGO_PROVIDER,
        externalEventId,
        eventType,
        payload,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return ok({ received: true, duplicated: true });
    }

    throw error;
  }

  if (!isPaymentEvent(payload, queryType)) {
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    return ok({ received: true, ignored: true });
  }

  try {
    const mercadoPagoPayment = await fetchMercadoPagoPayment(dataId);
    const payment = await applyMercadoPagoPaymentUpdate({
      mercadoPagoPayment,
      webhookEventId: webhookEvent.id,
    });

    return ok({
      received: true,
      paymentId: payment.id,
      status: payment.status,
    });
  } catch (error) {
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
    });

    console.error(error);
    return apiError("Webhook recebido, mas nao processado.", 500);
  }
}
