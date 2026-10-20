import { loginPathFor } from "@/lib/redirect";
import type { ApiErrorBody } from "@/lib/types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError(0, "No pudimos conectarnos. Revisá tu conexión.");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    // A dead session anywhere but the login form sends the user back to log in, then back here. This
    // module has no router access, and a full reload also wipes any cached data from the expired session.
    if (response.status === 401 && url !== "/api/auth/login") {
      const { pathname, search } = window.location;
      const next = encodeURIComponent(pathname + search);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${loginPathFor(pathname)}?next=${next}`);
    }
    throw new ApiError(response.status, body?.error ?? "Algo salió mal. Probá de nuevo.");
  }

  return response.json() as Promise<T>;
}
