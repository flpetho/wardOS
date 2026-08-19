import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/*
  The outer gate. Answers one question -- is anyone signed in -- and refreshes
  the session cookie while it is here.

  It deliberately does NOT check whether the signed-in person holds a calling.
  That needs a database query, and running one in middleware would put a round
  trip in front of every request including static assets. The membership check
  lives in app/(app)/layout.tsx, which is already a database-reading server
  component.

  So: middleware answers "are you signed in", the layout answers "are you on the
  guest list".
*/

/**
 * Routes reachable with no session.
 *
 * `/p/` and `/signup/` are the deliberately published surfaces -- the Sunday
 * bulletin and signup forms, which members open from a link with no account.
 * Everything else here exists to let someone get a session in the first place.
 */
const PUBLIC_PREFIXES = ["/p/", "/signup/", "/sign-in", "/auth/"];

/**
 * Public routes matched EXACTLY rather than by prefix.
 *
 * "/" is the marketing landing page. It has to live here and not in
 * PUBLIC_PREFIXES, because `"/anything".startsWith("/")` is true for every
 * path in the application -- adding it there would open the entire app to
 * anonymous requests while looking like a one-word change.
 */
const PUBLIC_EXACT = new Set(["/"]);

function isPublic(pathname: string) {
  return (
    PUBLIC_EXACT.has(pathname) ||
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix),
    )
  );
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  /*
    Someone who is already signed in and asks for the landing page wants the
    app, not the sales pitch.

    This lives here rather than in app/page.tsx because middleware has already
    resolved the session, so the page itself needs no database round trip and
    stays cheap to render.

    The ?code= guard matters: a magic link lands on "/" carrying a code, and if
    a stale session is present, redirecting to /dashboard here would swallow
    the code and silently sign the person in as whoever they were before.
    Falling through lets app/page.tsx forward it to /auth/callback.
  */
  const carriesAuthCode =
    request.nextUrl.searchParams.has("code") ||
    request.nextUrl.searchParams.has("token_hash");

  if (user && pathname === "/" && !carriesAuthCode) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";

    const toDashboard = NextResponse.redirect(dashboardUrl);
    for (const cookie of response.cookies.getAll()) {
      toDashboard.cookies.set(cookie);
    }
    return toDashboard;
  }

  if (user || isPublic(pathname)) {
    return response;
  }

  const signInUrl = request.nextUrl.clone();
  signInUrl.pathname = "/sign-in";
  signInUrl.search = "";
  signInUrl.searchParams.set("next", `${pathname}${search}`);

  const redirect = NextResponse.redirect(signInUrl);
  // Carry over any refreshed auth cookies. Returning a bare redirect would drop
  // the rotated token, logging the user out roughly once an hour.
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

export const config = {
  matcher: [
    /*
      Everything except static assets and image files. Images are excluded by
      extension as well as by path, because next/image serves optimised variants
      from /_next/image with the original path as a query parameter.
    */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
