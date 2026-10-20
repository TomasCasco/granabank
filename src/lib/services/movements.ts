import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toSearchKey } from "@/lib/search";
import type { MovementDTO, MovementType } from "@/lib/types";

const movementInclude = { card: { select: { brand: true, last4: true } } } as const;

type MovementRow = Prisma.MovementGetPayload<{ include: typeof movementInclude }>;

function toMovementDTO(m: MovementRow): MovementDTO {
  return {
    id: m.id,
    type: m.type,
    status: m.status,
    counterparty: m.counterparty,
    description: m.description,
    amountCents: m.amountCents,
    currency: m.currency,
    date: m.date.toISOString(),
    card: m.card,
  };
}

export async function listMovements(params: {
  userId: string;
  type?: MovementType;
  q?: string;
  limit?: number;
}): Promise<MovementDTO[]> {
  const search = params.q ? toSearchKey(params.q) : "";
  const rows = await prisma.movement.findMany({
    where: {
      userId: params.userId,
      ...(params.type && { type: params.type }),
      ...(search && { searchKey: { contains: search } }),
    },
    include: movementInclude,
    orderBy: { date: "desc" },
    take: params.limit,
  });
  return rows.map(toMovementDTO);
}

/** Scoped to the user: someone else's movement looks exactly like a missing one. */
export async function getMovement(userId: string, id: string): Promise<MovementDTO | null> {
  const row = await prisma.movement.findFirst({ where: { id, userId }, include: movementInclude });
  return row ? toMovementDTO(row) : null;
}
