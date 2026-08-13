import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";

/*
  Turns an emailed magic link into a session.

  Two shapes are accepted, because Supabase can send either:

    ?code=...        PKCE. What the default email template produces. The link
                     must be opened in the browser that requested it, since the
                     matching verifier is stored there.

    ?token_hash=...  Cross-device. Works when the link is requested on a laptop
                     and opened on a phone, which is a real pattern for a tool
                     used on Sunday morning. Requires the Supabase email
                     template to be pointed at this route -- see README.

  Supporting both means switching the template later is a dashboard change with
  no code change, and neither path is a special case.
*/

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeRedirect(searchParams.get("next"));

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(error.message)}`,
    );
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/sign-in?error=${encodeURIComponent("That sign-in link is incomplete. Request a new one.")}`,
  );
}
