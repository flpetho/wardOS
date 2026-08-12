"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FilePenLine, RotateCcw } from "lucide-react";
import { StatusBadge, statusLabel } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Commitment, CommitmentState, SeatKey, SeatWithHolder } from "@/lib/types";

const STATES: CommitmentState[] = ["proposed", "on_agenda", "committed", "done", "dropped"];
const OPEN_STATES: CommitmentState[] = ["proposed", "on_agenda", "committed"];

export function DashboardOperations({
  initialCommitments,
  seats,
}: {
  initialCommitments: Commitment[];
  seats: SeatWithHolder[];
}) {
  const [commitments, setCommitments] = useState(initialCommitments);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /*
    Resolved on the client only. This page is statically prerendered, so
    comparing against the clock during render would bake the build date into
    the HTML and then disagree with the browser on hydration.
  */
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const selected = commitments.find((item) => item.id === selectedId) ?? null;
  const open = commitments.filter((item) => OPEN_STATES.includes(item.state));
  const agenda = open.filter(
    (item) => item.state === "on_agenda" || item.state === "proposed",
  );

  const isOverdue = (item: Commitment) =>
    Boolean(today && item.dueDate && item.state === "committed" && item.dueDate < today);

  const updateCommitment = (next: Commitment) => {
    setCommitments((current) =>
      current.map((item) => (item.id === next.id ? next : item)),
    );
  };

  return (
    <>
      <section className="grid gap-5 lg:grid-cols-[1fr_1.35fr] xl:grid-cols-[1fr_1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>EQ Leadership</CardTitle>
            <CardDescription>Work owned by each calling.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border border-t border-border">
              {seats.map((seat) => {
                const owned = open.filter((item) => item.seatId === seat.id);
                const overdue = owned.filter(isOverdue);

                return (
                  <li key={seat.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-foreground">
                        {seat.holder?.name ?? "Seat vacant"}
                      </p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">{seat.title}</p>
                      <p data-numeric className="mt-1 text-[13px] text-muted-foreground">
                        {owned.length} open {owned.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    {overdue.length ? (
                      <Badge variant="warning">{overdue.length} overdue</Badge>
                    ) : (
                      <Badge variant="success">Clear</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commitments</CardTitle>
            <CardDescription>Select one to update its state or owner.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border border-t border-border">
              {open.map((item) => {
                const seat = seats.find((s) => s.id === item.seatId);
                const carried = Math.max(0, item.appearances.length - 1);

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="flex w-full items-start justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium text-foreground">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-muted-foreground">
                          {seat ? `${seat.holder?.name ?? seat.title} · ${seat.title}` : "Unassigned"}
                        </span>
                        <span className="mt-0.5 block text-[13px]">
                          {item.dueDate ? (
                            <span className="text-muted-foreground">
                              Due <time dateTime={item.dueDate}>{formatDate(item.dueDate)}</time>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">No due date</span>
                          )}
                          {isOverdue(item) ? (
                            <span className="font-medium text-attention"> · Overdue</span>
                          ) : null}
                          {carried > 0 ? (
                            <span className="text-progress">
                              {" "}
                              · Carried over {carried}×
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <StatusBadge status={item.state} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Meeting agenda</CardTitle>
            <CardDescription>Proposed and on-agenda items.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border border-t border-border">
              {agenda.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-foreground">{item.title}</p>
                    {item.responsibility ? (
                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {item.responsibility}
                      </p>
                    ) : null}
                  </div>
                  <StatusBadge status={item.state} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {selected ? (
        <CommitmentModal
          commitment={selected}
          seats={seats}
          onClose={() => setSelectedId(null)}
          onChange={updateCommitment}
        />
      ) : null}
    </>
  );
}

function CommitmentModal({
  commitment,
  seats,
  onClose,
  onChange,
}: {
  commitment: Commitment;
  seats: SeatWithHolder[];
  onClose: () => void;
  onChange: (commitment: Commitment) => void;
}) {
  const [draft, setDraft] = useState(commitment);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const seat = useMemo(
    () => seats.find((item) => item.id === draft.seatId),
    [draft.seatId, seats],
  );

  const update = <Key extends keyof Commitment>(key: Key, value: Commitment[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  // Mirrors the database constraint: a committed item needs an owner and a date.
  const canCommit = Boolean(draft.seatId && draft.dueDate);
  const invalid = draft.state === "committed" && !canCommit;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-foreground/25"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={draft.title}
        className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-y-auto rounded-t-xl border border-border bg-card shadow-raised sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Commitment</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Owned by the calling, not the person. Prototype edits are local only.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="c-title" className="text-[13px] font-medium">
              Title
            </label>
            <Input
              id="c-title"
              value={draft.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-seat" className="text-[13px] font-medium">
              Owning calling
            </label>
            <select
              id="c-seat"
              value={draft.seatId ?? ""}
              onChange={(event) =>
                update("seatId", (event.target.value || null) as SeatKey | null)
              }
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none transition-colors hover:border-border-strong focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-soft"
            >
              <option value="">Unassigned</option>
              {seats.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                  {item.holder ? ` — ${item.holder.name}` : ""}
                </option>
              ))}
            </select>
            {seat?.holder ? (
              <p className="text-[12px] text-muted-foreground">
                Currently held by {seat.holder.name}. Work stays with the calling on release.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-due" className="text-[13px] font-medium">
              Due date
            </label>
            <Input
              id="c-due"
              type="date"
              value={draft.dueDate ?? ""}
              onChange={(event) => update("dueDate", event.target.value || null)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-state" className="text-[13px] font-medium">
              State
            </label>
            <select
              id="c-state"
              value={draft.state}
              onChange={(event) => update("state", event.target.value as CommitmentState)}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none transition-colors hover:border-border-strong focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-soft"
            >
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {statusLabel(state)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Source</span>
            <p className="text-[13px] text-muted-foreground">
              {draft.source
                ? `Promoted from a ${draft.source.type} gap. Closing the record closes this.`
                : "Free-standing. Closed by hand."}
            </p>
          </div>

          {invalid ? (
            <p className="rounded-md bg-attention-soft px-3 py-2 text-[13px] text-attention sm:col-span-2">
              A committed item needs both an owning calling and a due date.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => update("state", "done")}>
              <CheckCircle2 data-icon="inline-start" />
              Mark done
            </Button>
            <Button variant="outline" size="sm" onClick={() => update("state", "on_agenda")}>
              <RotateCcw data-icon="inline-start" />
              Put on agenda
            </Button>
          </div>
          <Button
            size="sm"
            disabled={invalid}
            onClick={() => {
              onChange(draft);
              onClose();
            }}
          >
            <FilePenLine data-icon="inline-start" />
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
