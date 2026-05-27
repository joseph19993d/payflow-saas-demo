import { createHmac, timingSafeEqual } from "node:crypto";

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

import { getServerEnv } from "@/lib/env";

type SignatureParts = {
  ts: string;
  v1: string;
};

const WEBHOOK_TIMESTAMP_TOLERANCE_MS = 10 * 60 * 1000;

let mercadoPagoConfig: MercadoPagoConfig | null = null;

export function getMercadoPagoConfig() {
  if (!mercadoPagoConfig) {
    mercadoPagoConfig = new MercadoPagoConfig({
      accessToken: getServerEnv().MERCADO_PAGO_ACCESS_TOKEN,
    });
  }

  return mercadoPagoConfig;
}

export function getPreferenceClient() {
  return new Preference(getMercadoPagoConfig());
}

export function getPaymentClient() {
  return new Payment(getMercadoPagoConfig());
}

function parseSignatureHeader(signature: string | null): SignatureParts | null {
  if (!signature) return null;

  const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  if (!parts.ts || !parts.v1) return null;

  return {
    ts: parts.ts,
    v1: parts.v1,
  };
}

function isWebhookTimestampWithinTolerance(timestamp: string) {
  if (!/^\d+$/.test(timestamp)) {
    return false;
  }

  const parsedTimestamp = Number(timestamp);

  if (!Number.isSafeInteger(parsedTimestamp)) {
    return false;
  }

  const timestampMs =
    parsedTimestamp < 1_000_000_000_000 ? parsedTimestamp * 1000 : parsedTimestamp;
  const diffMs = Math.abs(Date.now() - timestampMs);

  return diffMs <= WEBHOOK_TIMESTAMP_TOLERANCE_MS;
}

export function validateMercadoPagoSignature(input: {
  dataId: string | null;
  requestId: string | null;
  signature: string | null;
}) {
  const signatureParts = parseSignatureHeader(input.signature);

  if (!input.dataId || !input.requestId || !signatureParts) {
    return false;
  }

  if (!isWebhookTimestampWithinTolerance(signatureParts.ts)) {
    return false;
  }

  const manifest = `id:${input.dataId};request-id:${input.requestId};ts:${signatureParts.ts};`;
  const expected = createHmac("sha256", getServerEnv().MERCADO_PAGO_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signatureParts.v1, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const paymentClient = getPaymentClient();
  return paymentClient.get({ id: paymentId });
}
