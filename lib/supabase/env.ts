/*
  The two values every Supabase client needs.

  Read through a function rather than at module scope so a missing value fails
  where it is used, with a message naming the file to fix, instead of crashing
  an unrelated import chain.

  Note what is deliberately absent: the service-role key. It bypasses row level
  security entirely, and nothing in wardOS needs it. Its absence is what closes
  known defect 16.
*/

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see .env.example).",
    );
  }

  return { url, anonKey };
}
