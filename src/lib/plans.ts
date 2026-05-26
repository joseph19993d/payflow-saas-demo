import { prisma } from "@/lib/prisma";

export async function getActivePlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPlanBySlug(slug: string) {
  return prisma.plan.findFirst({
    where: {
      slug,
      isActive: true,
    },
  });
}

export async function getFreePlan() {
  return getPlanBySlug("free");
}
