import { unauthorized } from "@/lib/api";
import { getProfile } from "@/lib/services/users";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  // A valid token for a user that no longer exists is treated as a dead session.
  const profile = await getProfile(userId);
  if (!profile) return unauthorized();

  return Response.json(profile);
}
