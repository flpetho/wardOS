"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  kind:
    | "Lesson"
    | "Assignment"
    | "Action item"
    | "Service"
    | "Cleaning"
    | "Meeting"
    | "Program"
    | "Event";
  note?: string;
};

type CalendarCell =
  | { key: string }
  | {
      key: string;
      day: number;
      date: string;
    };

const eventKinds: CalendarEvent["kind"][] = [
  "Event",
  "Assignment",
  "Action item",
];

export function DashboardCalendar({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const [events, setEvents] = useState(initialEvents);
  // Opens on the month the data starts in. Deliberately derived from the events
  // rather than from `new Date()` — this component is prerendered, so reading the
  // clock here renders one month on the server and another on the client.
  const [viewDate, setViewDate] = useState(() => startOfMonthFrom(initialEvents[0]?.date));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(formatDateFromDate(new Date()));
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);
  const daysWithEvents = useMemo(
    () =>
      cells
        .filter((cell): cell is Extract<CalendarCell, { date: string }> => "date" in cell)
        .map((cell) => ({ ...cell, items: events.filter((event) => event.date === cell.date) }))
        .filter((cell) => cell.items.length > 0),
    [cells, events],
  );

  const addEvent = (event: Omit<CalendarEvent, "id">) => {
    setEvents((currentEvents) =>
      [...currentEvents, { ...event, id: `event-${Date.now()}` }].sort((first, second) =>
        first.date.localeCompare(second.date),
      ),
    );
  };

  const goToMonth = (offset: number) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle>{monthLabel}</CardTitle>
            <CardDescription>
              Lessons, assignments, service, cleaning, meetings, and program work.
            </CardDescription>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft data-icon="" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goToMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight data-icon="" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(today ?? formatDate2(year, month, 1))}
            >
              <Plus data-icon="inline-start" />
              Add event
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Phone: an agenda of days that actually have something on them. A
              31-cell grid stacked into one column is a very long nothing. */}
          <div className="flex flex-col divide-y divide-border sm:hidden">
            {daysWithEvents.length ? (
              daysWithEvents.map((cell) => (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedDate(cell.date)}
                  className="flex min-w-0 items-start gap-3 py-3 text-left transition-colors hover:bg-surface-hover"
                >
                  <span
                    data-numeric
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-[13px] font-medium",
                      cell.date === today
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {cell.day}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    {cell.items.map((event) => (
                      <span key={`${event.kind}-${event.id}`} className="min-w-0 text-[13px]">
                        <span className="text-muted-foreground">{event.kind} · </span>
                        <span className="text-foreground">{event.title}</span>
                      </span>
                    ))}
                  </span>
                </button>
              ))
            ) : (
              <p className="py-8 text-center text-[14px] text-muted-foreground">
                Nothing scheduled this month.
              </p>
            )}
          </div>

          {/* Tablet and up: the month grid. */}
          <div className="hidden sm:flex sm:flex-col sm:gap-2">
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase tracking-[0.04em] text-subtle-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((cell) => {
                if (!("date" in cell)) {
                  return <div key={cell.key} className="min-h-24 rounded-md bg-surface" />;
                }

                const dayEvents = events.filter((event) => event.date === cell.date);
                const isToday = cell.date === today;

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDate(cell.date)}
                    className={cn(
                      "flex min-h-24 w-full min-w-0 flex-col gap-1 rounded-md border border-border bg-card p-1.5 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isToday && "border-primary bg-primary-soft",
                    )}
                  >
                    <span className="flex items-center justify-between gap-1">
                      <span
                        data-numeric
                        className={cn(
                          "inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-[12px] font-medium",
                          isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                        )}
                      >
                        {cell.day}
                      </span>
                      {dayEvents.length > 2 ? (
                        <span data-numeric className="text-[11px] text-subtle-foreground">
                          +{dayEvents.length - 2}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <span
                          key={`${event.kind}-${event.id}`}
                          className="min-w-0 rounded bg-muted px-1.5 py-1 text-[11px] leading-tight"
                        >
                          <span className="block truncate font-medium text-foreground">
                            {event.kind}
                          </span>
                          <span className="block truncate text-muted-foreground">{event.title}</span>
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDate ? (
        <CalendarDayModal
          date={selectedDate}
          events={events.filter((event) => event.date === selectedDate)}
          onClose={() => setSelectedDate(null)}
          onSave={addEvent}
        />
      ) : null}
    </>
  );
}

function CalendarDayModal({
  date,
  events,
  onClose,
  onSave,
}: {
  date: string;
  events: CalendarEvent[];
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<CalendarEvent["kind"]>("Event");
  const [note, setNote] = useState("");

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

  const save = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      date,
      kind,
      note: note.trim() || undefined,
    });
    setTitle("");
    setKind("Event");
    setNote("");
  };

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
        aria-label={formatDate(date, { weekday: "long", month: "long", day: "numeric" })}
        className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-y-auto rounded-t-xl border border-border bg-card shadow-raised sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold tracking-[-0.01em]">
              {formatDate(date, { weekday: "long", month: "long", day: "numeric" })}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Review the day, or add an event, assignment, or action item.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid gap-6 px-5 py-5 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2.5">
            <p className="text-[13px] font-medium text-muted-foreground">Scheduled</p>
            {events.length ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium">{event.title}</p>
                    {event.note ? (
                      <p className="mt-0.5 text-[13px] text-muted-foreground">{event.note}</p>
                    ) : null}
                  </div>
                  <Badge variant="outline">{event.kind}</Badge>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[13px] text-muted-foreground">
                Nothing scheduled for this day yet.
              </p>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-3.5">
            <p className="text-[13px] font-medium text-muted-foreground">Add to this day</p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="calendar-title" className="text-[13px] font-medium">
                Title
              </label>
              <Input
                id="calendar-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Event title"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="calendar-kind" className="text-[13px] font-medium">
                Type
              </label>
              <select
                id="calendar-kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as CalendarEvent["kind"])}
                className="h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none transition-colors hover:border-border-strong focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary-soft"
              >
                {eventKinds.map((eventKind) => (
                  <option key={eventKind} value={eventKind}>
                    {eventKind}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="calendar-note" className="text-[13px] font-medium">
                Note
              </label>
              <Textarea
                id="calendar-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Keep notes operational and non-sensitive."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!title.trim()}>
            Save to day
          </Button>
        </div>
      </div>
    </div>
  );
}

function startOfMonthFrom(iso: string | undefined) {
  const month = (iso ?? "2026-07-01").slice(0, 7);
  return new Date(`${month}-01T00:00:00`);
}

function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  return [
    ...Array.from({ length: firstWeekday }, (_, index) => ({ key: `empty-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = formatDate2(year, month, day);
      return { key: date, day, date };
    }),
  ];
}

function formatDate2(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDateFromDate(date: Date) {
  return formatDate2(date.getFullYear(), date.getMonth(), date.getDate());
}
