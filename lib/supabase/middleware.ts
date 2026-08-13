import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";

/**
 * Refreshes the Supabase session cookie and reports whether anyone is signed
 * in. Runs on every matched request from proxy.ts.
 *
 * The response object is rebuilt whenever cookies are written, because a
 * refreshed token has to reach the browser on this response — returning a
 * different NextResponse would silently drop it and log the user out roughly
 * once an hour, when the access token expires.
 */
export async function updateSession(request: NextRequest) {
  const { url, anonKey } = supabaseEnv();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser(), not getSession(): getSession trusts the cookie as-is, while
  // getUser revalidates the token against Supabase. A gate must not trust a
  // value the browser could have edited.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
