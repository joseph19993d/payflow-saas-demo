import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL precisa estar configurada para executar o seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

const plans = [
  {
    slug: "free",
    name: "Free",
    description: "Para validar o produto com recursos essenciais.",
    priceCents: 0,
    sortOrder: 1,
    features: ["1 workspace", "100 eventos por mes", "Dashboard basico"],
  },
  {
    slug: "pro",
    name: "Pro",
    description: "Para times pequenos que precisam automatizar billing.",
    priceCents: 4900,
    sortOrder: 2,
    features: [
      "5 workspaces",
      "10.000 eventos por mes",
      "Webhooks auditaveis",
      "Suporte por email",
    ],
  },
  {
    slug: "business",
    name: "Business",
    description: "Para operacoes com maior volume e rastreabilidade.",
    priceCents: 14900,
    sortOrder: 3,
    features: [
      "Workspaces ilimitados",
      "Eventos ilimitados",
      "Relatorios financeiros",
      "Suporte prioritario",
    ],
  },
];

async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
