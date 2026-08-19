"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DemoRequestState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fields?: Record<string, string> };

/*
  Runs under the anon key like every other client in wardOS. The insert is
  allowed by the "Anyone may request a demo" policy and nothing else is, so a
  bug here cannot read anything it should not.

  Validation is duplicated between here and the check constraints on the table
  on purpose. The constraints are the guarantee; these messages are the part a
  person can act on.
*/
export async function requestDemo(
  _previous: DemoRequestState,
  formData: FormData,
): Promise<DemoRequestState> {
  const read = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const name = read("name");
  const email = read("email");
  const calling = read("calling");
  const unit = read("unit");
  const note = read("note");

  const fields: Record<string, string> = {};
  if (!name) fields.name = "Please tell us your name.";
  if (name.length > 120) fields.name = "That is longer than this field allows.";
  if (!email) fields.email = "Please give us an email address to reply to.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fields.email = "That does not look like an email address.";
  if (note.length > 600) fields.note = "Please keep this under 600 characters.";

  if (Object.keys(fields).length > 0) {
    return { status: "error", message: "Please check the fields below.", fields };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("demo_requests").insert({
    name,
    email,
    calling: calling || null,
    unit: unit || null,
    note: note || null,
  });

  if (error) {
    /*
      The most likely cause by far is that migration 202608180001 has not been
      applied to the project yet, which returns "relation does not exist". Say
      something a visitor can act on rather than surfacing the Postgres text.
    */
    console.error("demo_requests insert failed:", error.message);
    return {
      status: "error",
      message:
        "Something went wrong saving that. Please email flpetho@gmail.com instead.",
    };
  }

  return { status: "success" };
}
