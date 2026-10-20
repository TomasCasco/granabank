import bcrypt from "bcryptjs";
import type { Card } from "@/generated/prisma/client";
import { cardStatus } from "@/lib/cards";
import { prisma } from "@/lib/prisma";
import type { CardDTO, ProfileDTO } from "@/lib/types";

// Compared against when the email doesn't exist, so both failure paths take the same time.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

/** Returns the user id when the credentials are valid, otherwise null. */
export async function authenticate(email: string, password: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  return user && valid ? user.id : null;
}

function toCardDTO(card: Card): CardDTO {
  return {
    id: card.id,
    brand: card.brand,
    last4: card.last4,
    holderName: card.holderName,
    expMonth: card.expMonth,
    expYear: card.expYear,
    status: cardStatus(card),
  };
}

export async function getProfile(userId: string): Promise<ProfileDTO | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { cards: { orderBy: { createdAt: "asc" } } },
  });
  if (!user) return null;

  return {
    name: user.name,
    email: user.email,
    balanceCents: user.balanceCents,
    currency: user.currency,
    // Active cards first so the Home carousel opens on a usable one.
    cards: user.cards.map(toCardDTO).sort((a, b) => Number(b.status === "ACTIVE") - Number(a.status === "ACTIVE")),
  };
}
