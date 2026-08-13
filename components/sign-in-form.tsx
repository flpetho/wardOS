"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Status = { kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string };

export function SignInForm({ next, initialError }: { next: string; initialError?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(
    initialError ? { kind: "error", message: initialError } : { kind: "idle" },
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;

    setStatus({ kind: "sending" });
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    setStatus(error ? { kind: "error", message: error.message } : { kind: "sent" });
  }

  if (status.kind === "sent") {
    return (
      <div className="rounded-lg border border-border bg-surface px-5 py-6 text-center">
        <Mail className="mx-auto size-5 text-primary" />
        <p className="mt-3 text-[15px] font-medium">Check your email</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          A sign-in link is on its way to{" "}
          <span className="font-medium text-foreground">{email.trim()}</span>. It is
          valid for one hour.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-4 text-[13px] font-medium text-primary hover:text-primary-hover"
        >
          Use a different address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[13px] font-medium">
          Email address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status.kind === "sending"}
        />
      </div>

      <Button type="submit" size="lg" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? (
          <>
            <Loader2 data-icon="inline-start" className="animate-spin" />
            Sending
          </>
        ) : (
          "Email me a sign-in link"
        )}
      </Button>

      {status.kind === "error" ? (
        <p
          role="alert"
          className="rounded-md bg-attention-soft px-3 py-2 text-[13px] leading-relaxed text-attention"
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
