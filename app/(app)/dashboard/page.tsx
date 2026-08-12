import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { DashboardCalendar, type CalendarEvent } from "@/components/dashboard-calendar";
import { DashboardOperations } from "@/components/dashboard-operations";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  agendaItems,
  assignments,
  budgetSummary,
  cleaningAssignments,
  leadershipRoles,
  meetings,
  lessons,
  serviceOpportunities,
  sundayProgram,
  workspace,
} from "@/lib/data";

type Attention = {
  id: string;
  title: string;
  area: string;
  status: string;
};

export default function DashboardPage() {
  const currentLesson = lessons[0];
  const attention = buildAttentionList();
  const budgetSpent = budgetSummary.categories.reduce((sum, item) => sum + item.spent, 0);
  const budgetPending = budgetSummary.categories.reduce((sum, item) => sum + item.pending, 0);
  const budgetRemaining = budgetSummary.totalAllocated - budgetSpent - budgetPending;
  const budgetUsedPercent = Math.round(
    ((budgetSpent + budgetPending) / budgetSummary.totalAllocated) * 100,
  );

  return (
    <>
      <PageHeading
        title={workspace.name}
        description="Sunday preparation, service work, cleaning coverage, and follow-up items for the quorum presidency."
        action={
          <Link href={`/p/${workspace.slug}/program`}>
            <Button variant="outline">
              Public program
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
        }
      />

      <section aria-labelledby="this-sunday">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="this-sunday"
            className="text-[17px] font-semibold tracking-[-0.01em] text-foreground"
          >
            This Sunday
          </h2>
          <time
            dateTime={sundayProgram.programDate}
            className="text-[13px] text-muted-foreground"
          >
            {formatDate(sundayProgram.programDate, { weekday: "long", month: "long", day: "numeric" })}
          </time>
        </div>

        <dl className="mt-4 overflow-hidden rounded-lg border border-border">
          <SundayRow label="Quorum lesson">
            <span className="font-medium text-foreground">{currentLesson.topic}</span>
            <span className="text-muted-foreground"> · taught by {currentLesson.teacher}</span>
          </SundayRow>
          <SundayRow label="Speakers">{sundayProgram.speakers.join(", ")}</SundayRow>
          <SundayRow label="Opening hymn">{sundayProgram.openingHymn}</SundayRow>
          <SundayRow label="Conducting">{sundayProgram.conducting}</SundayRow>
          <SundayRow label="Program">
            <span className="inline-flex items-center gap-2.5">
              <StatusBadge status={sundayProgram.status} />
              <Link
                href="/program"
                className="text-[13px] font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Edit program
              </Link>
            </span>
          </SundayRow>
        </dl>
      </section>

      <section aria-labelledby="needs-attention">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="needs-attention"
            className="text-[17px] font-semibold tracking-[-0.01em] text-foreground"
          >
            Needs attention
          </h2>
          <span data-numeric className="text-[13px] text-muted-foreground">
            {attention.length} {attention.length === 1 ? "item" : "items"}
          </span>
        </div>

        {attention.length ? (
          <ul className="mt-4 overflow-hidden rounded-lg border border-border">
            {attention.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <span
                    aria-hidden
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-attention"
                  />
                  <span className="min-w-0 text-[14px] text-foreground">{item.title}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3 pl-4 sm:pl-0">
                  <span className="text-[13px] text-muted-foreground">{item.area}</span>
                  <StatusBadge status={item.status} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-8 text-center text-[14px] text-muted-foreground">
            Nothing is waiting on the presidency right now.
          </p>
        )}
      </section>

      <DashboardCalendar initialEvents={buildCalendarEvents()} />

      <DashboardOperations
        initialAssignments={assignments}
        agendaItems={agendaItems}
        leadershipRoles={leadershipRoles}
      />

      <section aria-labelledby="coverage" className="grid gap-5 lg:grid-cols-3">
        <h2 id="coverage" className="sr-only">
          Service, cleaning, and budget
        </h2>

        <Panel title="Service" href="/service" linkLabel="All service">
          {serviceOpportunities.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {item.needed} · <time dateTime={item.date}>{formatDate(item.date)}</time>
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </Panel>

        <Panel title="Cleaning" href="/cleaning" linkLabel="All cleaning">
          {cleaningAssignments.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-foreground">
                  <time dateTime={item.cleaningDate}>
                    {formatDate(item.cleaningDate, { weekday: "short", month: "long", day: "numeric" })}
                  </time>
                </p>
                <p data-numeric className="mt-0.5 text-[13px] text-muted-foreground">
                  {item.confirmedFamilies.length} of {item.familiesNeeded} families confirmed
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </Panel>

        <Panel title="Budget" href="/budget" linkLabel="Full budget">
          <div>
            <p data-numeric className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">
              {formatCurrency(budgetRemaining)}
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              remaining of {formatCurrency(budgetSummary.totalAllocated)} for {budgetSummary.year}
            </p>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`${budgetUsedPercent}% of the budget committed`}
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${budgetUsedPercent}%` }}
              />
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}

function SundayRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-6 sm:py-2.5">
      <dt className="shrink-0 text-[13px] text-muted-foreground sm:w-36">{label}</dt>
      <dd className="min-w-0 text-[14px] text-foreground">{children}</dd>
    </div>
  );
}

function Panel({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border">
      <div className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-3">
        <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">{title}</h3>
        <Link
          href={href}
          className="text-[13px] font-medium text-primary transition-colors hover:text-primary-hover"
        >
          {linkLabel}
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-4 py-4">{children}</div>
    </div>
  );
}

/*
  Derived from status only. Deliberately avoids comparing against `new Date()` —
  the dashboard is statically prerendered, so any build-time date comparison
  bakes in at build and disagrees with the client on hydration. See STATE.md.
*/
function buildAttentionList(): Attention[] {
  const items: Attention[] = [];

  for (const lesson of lessons) {
    if (lesson.status === "Needs teacher" || lesson.status === "Needs topic") {
      items.push({
        id: lesson.id,
        title: `${formatDate(lesson.date)} lesson — ${lesson.topic}`,
        area: "Lessons",
        status: lesson.status,
      });
    }
  }

  for (const cleaning of cleaningAssignments) {
    if (cleaning.status === "Needs families" || cleaning.status === "Partially filled") {
      const short = cleaning.familiesNeeded - cleaning.confirmedFamilies.length;
      items.push({
        id: cleaning.id,
        title: `${formatDate(cleaning.cleaningDate)} cleaning needs ${short} more ${short === 1 ? "family" : "families"}`,
        area: "Cleaning",
        status: cleaning.status,
      });
    }
  }

  for (const service of serviceOpportunities) {
    if (service.status === "Draft") {
      items.push({
        id: service.id,
        title: `${service.title} has not been opened for signups`,
        area: "Service",
        status: service.status,
      });
    }
  }

  for (const assignment of assignments) {
    if (assignment.status === "Waiting") {
      items.push({
        id: assignment.id,
        title: assignment.title,
        area: assignment.relatedModule,
        status: assignment.status,
      });
    }
  }

  return items;
}

function buildCalendarEvents(): CalendarEvent[] {
  return [
    ...lessons.map((lesson) => ({
      id: lesson.id,
      date: lesson.date,
      title: lesson.topic,
      kind: "Lesson" as const,
    })),
    ...assignments.map((assignment) => ({
      id: assignment.id,
      date: assignment.dueDate,
      title: assignment.title,
      kind: "Assignment" as const,
    })),
    ...serviceOpportunities.map((service) => ({
      id: service.id,
      date: service.date,
      title: service.title,
      kind: "Service" as const,
    })),
    ...cleaningAssignments.map((cleaning) => ({
      id: cleaning.id,
      date: cleaning.cleaningDate,
      title: "Meetinghouse cleaning",
      kind: "Cleaning" as const,
    })),
    ...meetings.map((meeting) => ({
      id: meeting.id,
      date: meeting.meetingDate,
      title: meeting.title,
      kind: "Meeting" as const,
    })),
    {
      id: "program-current",
      date: sundayProgram.programDate,
      title: "Published Sunday program",
      kind: "Program" as const,
    },
  ].sort((first, second) => first.date.localeCompare(second.date));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
