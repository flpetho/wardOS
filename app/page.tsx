import { redirect } from "next/navigation";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string }>;
}) {
  const params = await searchParams;

  /*
    Fallback for a misconfigured redirect allow list.

    When `emailRedirectTo` is not on Supabase's allow list, Supabase does not
    fail -- it quietly redirects to the project's Site URL instead. The sign-in
    code then lands here rather than on /auth/callback, and the link appears to
    do nothing at all, which is the single most common way magic-link sign-in
    breaks.

    Forwarding it keeps that misconfiguration from looking like a broken app.
    The allow list should still be set correctly; see README.
  */
  if (params.code || params.token_hash) {
    const forwarded = new URLSearchParams();
    if (params.code) forwarded.set("code", params.code);
    if (params.token_hash) forwarded.set("token_hash", params.token_hash);
    if (params.type) forwarded.set("type", params.type);
    redirect(`/auth/callback?${forwarded.toString()}`);
  }

  redirect("/dashboard");
}
