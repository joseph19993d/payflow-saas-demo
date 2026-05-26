import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, mapApiError, ok } from "@/lib/api";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      return apiError("Email ou senha invalidos.", 401);
    }

    const passwordMatches = await verifyPassword(input.password, user.passwordHash);

    if (!passwordMatches) {
      return apiError("Email ou senha invalidos.", 401);
    }

    await setSessionCookie({ sub: user.id, email: user.email });

    return ok({ redirectTo: "/dashboard" });
  } catch (error) {
    return mapApiError(error);
  }
}
