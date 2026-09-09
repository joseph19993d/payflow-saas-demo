import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

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
    description: "Para validar el producto con recursos esenciales.",
    priceCents: 0,
    sortOrder: 1,
    features: ["1 espacio de trabajo", "100 eventos por mes", "Panel básico"],
  },

  {
    slug: "pro",
    name: "Pro",
    description: "Para equipos pequeños que necesitan automatizar la facturación.",
    priceCents: 4900,
    sortOrder: 2,
    features: [
      "5 espacios de trabajo",
      "10.000 eventos por mes",
      "Webhooks auditables",
      "Soporte por correo electrónico",
    ],
  },

  {
    slug: "business",
    name: "Business",
    description: "Para operaciones con mayor volumen y trazabilidad.",
    priceCents: 14900,
    sortOrder: 3,
    features: [
      "Espacios de trabajo ilimitados",
      "Eventos ilimitados",
      "Informes financieros",
      "Soporte prioritario",
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

  const adminName = process.env.ADMIN_SEED_NAME;
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

  if (adminName && adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        passwordHash,
        role: "ADMIN",
      },
      create: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Admin user ${adminEmail} seeded successfully.`);
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
