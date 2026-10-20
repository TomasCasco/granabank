import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type MovementStatus, type MovementType } from "../src/generated/prisma/client";
import { toSearchKey } from "../src/lib/search";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }),
});

type SeedMovement = {
  counterparty: string;
  type: MovementType;
  amount: number;
  description?: string;
  status?: MovementStatus;
  card?: "mastercard" | "visa";
};

// Newest first. The first five match the Home screen in the Figma, in order.
const movements: SeedMovement[] = [
  { counterparty: "Adobe", type: "SUBSCRIPTION", amount: 125, description: "Plan Creative Cloud", card: "mastercard" },
  { counterparty: "Ronaldo", type: "CASH_IN", amount: 95, description: "Devolución cena" },
  { counterparty: "Figma", type: "SUBSCRIPTION", amount: 125, description: "Plan Professional", card: "mastercard" },
  { counterparty: "Juan Perez", type: "CASH_OUT", amount: 95, description: "Entradas Lanús vs. Banfield" },
  { counterparty: "Martin Bozzini", type: "CASH_IN", amount: 95 },
  { counterparty: "José Suárez", type: "CASH_IN", amount: 95, description: "Cuota social" },
  { counterparty: "Juan Rodríguez", type: "CASH_OUT", amount: 95, status: "PENDING" },
  { counterparty: "Julio César", type: "CASH_IN", amount: 95 },
  { counterparty: "Mariano Martinez", type: "CASH_OUT", amount: 95, description: "Camiseta oficial" },
  { counterparty: "Spotify", type: "SUBSCRIPTION", amount: 11.99, description: "Plan Premium", card: "visa", status: "FAILED" },
  { counterparty: "Juan David", type: "CASH_IN", amount: 95 },
  { counterparty: "Netflix", type: "SUBSCRIPTION", amount: 15.49, description: "Plan Estándar", card: "mastercard" },
  { counterparty: "Juan Cabrera", type: "CASH_IN", amount: 95 },
  { counterparty: "Jorge Álvarez", type: "CASH_OUT", amount: 95, description: "Asado post partido" },
];

async function main() {
  await prisma.user.deleteMany({ where: { email: "soygranate@clublanus.com" } });

  const user = await prisma.user.create({
    data: {
      email: "soygranate@clublanus.com",
      name: "Granate",
      passwordHash: await bcrypt.hash("GRANATE1@", 10),
      balanceCents: 97885,
      cards: {
        create: [
          { brand: "MASTERCARD", last4: "1234", holderName: "Soy Granate", expMonth: 2, expYear: 2030 },
          // Already expired, so the app shows an inactive card.
          { brand: "VISA", last4: "5678", holderName: "Soy Granate", expMonth: 8, expYear: 2025 },
        ],
      },
    },
    include: { cards: true },
  });

  const cardIds = {
    mastercard: user.cards.find((c) => c.brand === "MASTERCARD")!.id,
    visa: user.cards.find((c) => c.brand === "VISA")!.id,
  };

  // One movement every ~19 hours going back from now.
  const now = Date.now();
  await prisma.movement.createMany({
    data: movements.map((m, i) => ({
      userId: user.id,
      cardId: m.card ? cardIds[m.card] : null,
      type: m.type,
      status: m.status ?? "COMPLETED",
      counterparty: m.counterparty,
      searchKey: toSearchKey(m.counterparty),
      description: m.description ?? null,
      amountCents: Math.round(m.amount * 100),
      date: new Date(now - i * 19 * 60 * 60 * 1000),
    })),
  });

  console.log(`Seeded ${user.email} with ${user.cards.length} cards and ${movements.length} movements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
