import { jsonError } from "@/lib/api";
import { authenticate } from "@/lib/services/users";
import { startSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, parsed.error.issues[0].message);

  const { email, password, remember } = parsed.data;
  const userId = await authenticate(email, password);
  // Same message for unknown email and wrong password so the form doesn't reveal which accounts exist.
  if (!userId) return jsonError(401, "Email o contraseña incorrectos");

  await startSession(userId, remember);
  return Response.json({ ok: true });
}
