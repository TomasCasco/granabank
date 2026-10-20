import type { ApiErrorBody } from "@/lib/types";

export function jsonError(status: number, error: string) {
  return Response.json({ error } satisfies ApiErrorBody, { status });
}

export const unauthorized = () => jsonError(401, "Tu sesión expiró. Volvé a ingresar.");
