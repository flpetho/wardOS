import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardList, Megaphone, Users } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  assignments,
  cleaningAssignments,
  lessons,
  serviceOpportunities,
  sundayProgram,
  workspace,
} from "@/lib/data";

export default function DashboardPage() {
  const openAssignments = assignments.filter((item) => item.status !== "Completed");
  const currentLesson = lessons[0];

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
        <SummaryCard title="Open signups" value="2" detail="Service and cleaning" icon={<Users />} />
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

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Action items needing ownership.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {assignments.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.owner} · due {item.dueDate}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </CardContent>
        </Card>

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
