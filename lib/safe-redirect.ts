/**
 * Constrains a post-sign-in redirect to a path inside this app.
 *
 * The `next` parameter travels through an email, so it is attacker-supplied by
 * definition. Without this, a crafted link could bounce a signed-in presidency
 * member to an external site that looks like wardOS and asks for another
 * sign-in. "//evil.com" is rejected alongside "https://evil.com": browsers read
 * a protocol-relative URL as absolute.
 */
export function safeRedirect(next: string | null | undefined, fallback = "/dashboard") {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.startsWith("/\\")) return fallback;
  return next;
}
