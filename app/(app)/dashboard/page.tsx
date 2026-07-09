import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  Megaphone,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { DashboardCalendar, type CalendarEvent } from "@/components/dashboard-calendar";
import { DashboardOperations } from "@/components/dashboard-operations";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function DashboardPage() {
  const openAssignments = assignments.filter((item) => item.status !== "Completed");
  const currentLesson = lessons[0];
  const budgetSpent = budgetSummary.categories.reduce((sum, item) => sum + item.spent, 0);
  const budgetPending = budgetSummary.categories.reduce((sum, item) => sum + item.pending, 0);
  const budgetRemaining = budgetSummary.totalAllocated - budgetSpent - budgetPending;
  const calendarEvents = buildCalendarEvents();

  return (
    <>
      <PageHeading
        title={`${workspace.name} operating dashboard`}
        description="The current ward-level view for Sunday preparation, service work, cleaning coverage, and follow-up items."
        action={
          <Link href={`/p/${workspace.slug}/program`}>
            <Button variant="outline">
              Public program
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="This Sunday" value={currentLesson.topic} detail={currentLesson.teacher} icon={<CalendarCheck />} />
        <SummaryCard title="Program" value={sundayProgram.status} detail={sundayProgram.programDate} icon={<Megaphone />} />
        <SummaryCard title="Open assignments" value={String(openAssignments.length)} detail="Across active modules" icon={<ClipboardList />} />
        <SummaryCard title="Budget remaining" value={formatCurrency(budgetRemaining)} detail={`${budgetSummary.year} EQ budget`} icon={<DollarSign />} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Next Sunday</CardTitle>
            <CardDescription>Visible in the public program when published.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Sacrament meeting</p>
              <p className="mt-2 font-medium">{sundayProgram.speakers.join(", ")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{sundayProgram.openingHymn}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Elders Quorum lesson</p>
              <p className="mt-2 font-medium">{currentLesson.topic}</p>
              <p className="mt-1 text-sm text-muted-foreground">Teacher: {currentLesson.teacher}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy guardrail</CardTitle>
            <CardDescription>v0 stores operational data only.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p>
              Visit lists, ministering assignments, and other sensitive sources remain link-only
              until the presidency defines the right review boundary.
            </p>
            <Link href="/sources" className="font-medium text-primary">
              Review source treatment
            </Link>
          </CardContent>
        </Card>
      </section>

      <DashboardCalendar initialEvents={calendarEvents} />

      <DashboardOperations
        initialAssignments={assignments}
        agendaItems={agendaItems}
        leadershipRoles={leadershipRoles}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service</CardTitle>
            <CardDescription>Opportunities that need volunteers.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {serviceOpportunities.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{item.title}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.needed} · {item.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cleaning</CardTitle>
            <CardDescription>Saturday coverage.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {cleaningAssignments.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{item.cleaningDate}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.confirmedFamilies.length}/{item.familiesNeeded} families confirmed
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="truncate text-2xl font-semibold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
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
