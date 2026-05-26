import { NextRequest } from "next/server";
import { z } from "zod";

import { mapApiError, ok } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { createCheckoutForPlan } from "@/lib/payments";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  planSlug: z.enum(["pro", "business"]),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const input = checkoutSchema.parse(await request.json());
    const checkout = await createCheckoutForPlan({
      userId: user.id,
      planSlug: input.planSlug,
    });

    return ok(checkout);
  } catch (error) {
    return mapApiError(error);
  }
}
