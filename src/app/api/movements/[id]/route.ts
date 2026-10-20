import type { NextRequest } from "next/server";
import { jsonError, unauthorized } from "@/lib/api";
import { getMovement } from "@/lib/services/movements";
import { getSessionUserId } from "@/lib/session";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/movements/[id]">) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const { id } = await ctx.params;
  const movement = await getMovement(userId, id);
  if (!movement) return jsonError(404, "No encontramos este movimiento");

  return Response.json(movement);
}
