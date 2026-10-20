import type { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, unauthorized } from "@/lib/api";
import { listMovements } from "@/lib/services/movements";
import { getSessionUserId } from "@/lib/session";
import { MOVEMENT_TYPES } from "@/lib/types";

const querySchema = z.object({
  type: z.enum(MOVEMENT_TYPES, "Filtro inválido").optional(),
  q: z.string().trim().max(50, "La búsqueda puede tener hasta 50 caracteres").optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) return jsonError(400, parsed.error.issues[0].message);

  return Response.json(await listMovements({ userId, ...parsed.data }));
}
