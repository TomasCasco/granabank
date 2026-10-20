const LOGIN_PATHS = ["/login", "/v2/login"];

/** The login page for the app version a path belongs to. */
export function loginPathFor(pathname: string): string {
  return pathname === "/v2" || pathname.startsWith("/v2/") ? "/v2/login" : "/login";
}

/**
 * Where to go after logging in. Only same-site paths are allowed, so a crafted
 * `/login?next=https://evil.com` link can't bounce the user to another site (open redirect).
 */
export function safeNextPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/")) return fallback;
  // "//host" and "/\host" are protocol-relative URLs that browsers resolve to another origin.
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  const path = value.split("?")[0];
  if (LOGIN_PATHS.includes(path)) return fallback;
  return value;
}
