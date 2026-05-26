import { z } from "zod";

const serverEnvSchema = z.object({
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().min(1),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
});

export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const variables = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Variaveis de ambiente invalidas ou ausentes: ${variables}`);
  }

  return parsed.data;
}

export function getAppUrl() {
  return process.env.APP_URL ?? "http://localhost:3000";
}
