"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SignupForm } from "@/lib/types";

export function PublicSignupForm({ form }: { form: SignupForm }) {
  const [name, setName] = useState("");
  const [slotId, setSlotId] = useState(form.slots[0]?.id || "");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border bg-card p-5 text-center">
        <CheckCircle2 className="mx-auto text-primary" />
        <h2 className="mt-3 text-xl font-semibold">You are signed up</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks, {name}. The presidency will see your response in wardOS.
        </p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-lg border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim() && slotId) {
          setSubmitted(true);
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="slot" className="text-sm font-medium">
          Signup slot
        </label>
        <select
          id="slot"
          value={slotId}
          onChange={(event) => setSlotId(event.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          {form.slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {slot.title}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit">Submit signup</Button>
    </form>
  );
}
