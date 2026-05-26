import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function mapApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError("Dados enviados invalidos.", 422);
  }

  if (error instanceof Error && error.message === "UNAUTHENTICATED") {
    return apiError("Faca login para continuar.", 401);
  }

  console.error(error);
  return apiError("Nao foi possivel concluir a operacao.", 500);
}
