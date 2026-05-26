import { NextRequest } from "next/server";

import { apiError, mapApiError, ok } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireCurrentUser();
    const { id } = await context.params;
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
        status: true,
        amountCents: true,
        currency: true,
        updatedAt: true,
      },
    });

    if (!payment) {
      return apiError("Pagamento nao encontrado.", 404);
    }

    return ok({ payment });
  } catch (error) {
    return mapApiError(error);
  }
}
