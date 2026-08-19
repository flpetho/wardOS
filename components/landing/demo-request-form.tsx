"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Lock } from "lucide-react";

import { requestDemo, type DemoRequestState } from "@/app/actions/request-demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    /*
      content-start matters. Without it the wrapper stretches to the tallest
      field in its grid row and distributes the slack between label, input and
      hint, so a two-line hint on one field lifts its input a few pixels out of
      line with its neighbour.
    */
    <div className="grid content-start gap-2">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[12px] text-attention">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="w-full transition-transform active:translate-y-px sm:w-auto"
    >
      {pending ? "Sending your request" : "Request a demo"}
    </Button>
  );
}

export function DemoRequestForm() {
  const [state, action] = useActionState<DemoRequestState, FormData>(requestDemo, {
    status: "idle",
  });

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
        <p className="flex items-center gap-2 text-[15px] font-semibold text-ok">
          <Check data-icon="" aria-hidden />
          Request received
        </p>
        <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
          Thank you. You will get a reply from a person, not a system, and
          probably not the same day. wardOS is built in evenings around a calling
          and a full-time job.
        </p>
      </div>
    );
  }

  const fields = state.status === "error" ? (state.fields ?? {}) : {};

  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.status === "error" && !state.fields ? (
        <p
          role="alert"
          className="rounded-md border border-attention/25 bg-attention-soft px-3 py-2 text-[13px] text-attention"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" error={fields.name}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            aria-invalid={Boolean(fields.name)}
            aria-describedby={fields.name ? "name-error" : undefined}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={fields.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(fields.email)}
            aria-describedby={fields.email ? "email-error" : undefined}
          />
        </Field>

        <Field
          label="Calling"
          htmlFor="calling"
          hint="Optional. Helps us know which seat you are looking at this from."
        >
          <Input id="calling" name="calling" placeholder="Relief Society President" />
        </Field>

        <Field label="Ward or stake" htmlFor="unit" hint="Optional.">
          <Input id="unit" name="unit" />
        </Field>
      </div>

      <Field
        label="Anything you want us to know"
        htmlFor="note"
        error={fields.note}
        hint="Optional, and operational only. Please do not describe any individual or family circumstance here."
      >
        <Textarea
          id="note"
          name="note"
          rows={4}
          maxLength={600}
          aria-invalid={Boolean(fields.note)}
          aria-describedby={fields.note ? "note-error" : undefined}
        />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton />
        <p className="flex items-start gap-1.5 text-[12px] leading-relaxed text-muted-foreground sm:items-center">
          <Lock data-icon="" aria-hidden className="mt-0.5 sm:mt-0" />
          Your details are only used to reply to you.
        </p>
      </div>
    </form>
  );
}
