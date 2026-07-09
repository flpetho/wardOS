"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
  const [viewDate, setViewDate] = useState(new Date("2026-07-01T00:00:00"));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);
  const today = formatDateFromDate(new Date());

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
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>{monthLabel}</CardTitle>
            <CardDescription>
              Lessons, assignments, service, cleaning, meetings, program work, and added events.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => goToMonth(-1)}>
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => goToMonth(1)}>
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
            <Button size="sm" onClick={() => setSelectedDate(today)}>
              <Plus data-icon="inline-start" />
              Add event
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
            {cells.map((cell) => {
              if (!("date" in cell)) {
                return (
                  <div
                    key={cell.key}
                    className="hidden min-h-32 rounded-md border bg-muted/25 sm:block"
                  />
                );
              }

              const dayEvents = events.filter((event) => event.date === cell.date);
              const isToday = cell.date === today;

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedDate(cell.date)}
                  className={cn(
                    "relative block min-h-32 w-full rounded-md border bg-card p-2 text-left align-top transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isToday && "border-primary bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-2 top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-sm font-medium leading-none",
                      isToday && "bg-primary text-primary-foreground",
                    )}
                  >
                    {cell.day}
                  </span>
                  {dayEvents.length ? (
                    <span className="absolute right-2 top-2 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {dayEvents.length}
                    </span>
                  ) : null}
                  <div className="flex flex-col gap-1 pt-8">
                    {dayEvents.slice(0, 4).map((event) => (
                      <div
                        key={`${event.kind}-${event.id}`}
                        className="rounded-md border px-2 py-1 text-xs"
                      >
                        <p className="font-medium">{event.kind}</p>
                        <p className="truncate text-muted-foreground">{event.title}</p>
                      </div>
                    ))}
                    {dayEvents.length > 4 ? (
                      <p className="text-xs text-muted-foreground">
                        +{dayEvents.length - 4} more
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate ? (
        <CalendarDayModal
          date={selectedDate}
          events={events.filter((event) => event.date === selectedDate)}
          onClose={() => setSelectedDate(null)}
          onSave={(event) => {
            addEvent(event);
          }}
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
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4">
      <div className="w-full max-w-2xl rounded-lg border bg-card shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">{dateLabel}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review the day and add an event, assignment, or action item.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Scheduled</p>
            {events.length ? (
              events.map((event) => (
                <div key={event.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      {event.note ? (
                        <p className="mt-1 text-muted-foreground">{event.note}</p>
                      ) : null}
                    </div>
                    <Badge variant="outline">{event.kind}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Nothing scheduled for this day yet.
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <p className="text-sm font-medium">Add to this day</p>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="calendar-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="calendar-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Event title"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="calendar-kind" className="text-sm font-medium">
              Type
            </label>
            <select
              id="calendar-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as CalendarEvent["kind"])}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {eventKinds.map((eventKind) => (
                <option key={eventKind} value={eventKind}>
                  {eventKind}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="calendar-note" className="text-sm font-medium">
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

        <div className="flex justify-end gap-2 border-t p-5">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save to day</Button>
        </div>
      </div>
    </div>
  );
}

function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  return [
    ...Array.from({ length: firstWeekday }, (_, index) => ({ key: `empty-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = formatDate(year, month, day);
      return { key: date, day, date };
    }),
  ];
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDateFromDate(date: Date) {
  return formatDate(date.getFullYear(), date.getMonth(), date.getDate());
}
