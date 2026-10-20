/**
 * Where to go after logging in. Only same-site paths are allowed, so a crafted
 * `/login?next=https://evil.com` link can't bounce the user to another site (open redirect).
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/")) return "/";
  // "//host" and "/\host" are protocol-relative URLs that browsers resolve to another origin.
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (value === "/login" || value.startsWith("/login?")) return "/";
  return value;
}
