import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, mapApiError, ok } from "@/lib/api";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { getFreePlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(72),
});

export async function POST(request: NextRequest) {
  try {
    const input = registerSchema.parse(await request.json());
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingUser) {
      return apiError("Este email ja esta cadastrado.", 409);
    }

    const freePlan = await getFreePlan();
    const passwordHash = await hashPassword(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
        },
      });

      if (freePlan) {
        await tx.subscription.create({
          data: {
            userId: createdUser.id,
            planId: freePlan.id,
            status: "ACTIVE",
            startsAt: new Date(),
          },
        });
      }

      return createdUser;
    });

    await setSessionCookie({ sub: user.id, email: user.email });

    return ok({ redirectTo: "/dashboard" }, { status: 201 });
  } catch (error) {
    return mapApiError(error);
  }
}
