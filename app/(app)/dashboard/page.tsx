import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  Megaphone,
} from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  agendaItems,
  assignments,
  budgetSummary,
  cleaningAssignments,
  leadershipRoles,
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

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
            <CardDescription>
              Operational view of the {budgetSummary.year} quorum budget.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Remaining after spent and pending</p>
              <p className="mt-1 text-3xl font-semibold">{formatCurrency(budgetRemaining)}</p>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Allocated</p>
                <p className="font-medium">{formatCurrency(budgetSummary.totalAllocated)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Spent</p>
                <p className="font-medium">{formatCurrency(budgetSpent)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Pending</p>
                <p className="font-medium">{formatCurrency(budgetPending)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep reimbursements and confidential financial assistance outside wardOS.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget categories</CardTitle>
            <CardDescription>Spending progress by operating area.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {budgetSummary.categories.map((category) => {
              const committed = category.spent + category.pending;
              const percent = Math.min(Math.round((committed / category.allocated) * 100), 100);

              return (
                <div key={category.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(committed)} committed of {formatCurrency(category.allocated)}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(category.allocated - committed)} left
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>EQ Leadership</CardTitle>
            <CardDescription>Role-owned work across the presidency.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {leadershipRoles.map((role) => {
              const roleAssignments = assignments.filter((item) => item.ownerRole === role.id);
              const roleAgenda = agendaItems.filter((item) => item.ownerRole === role.id);

              return (
                <div key={role.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{role.navLabel} · {role.person}</p>
                      <p className="text-sm text-muted-foreground">
                        {role.responsibilities.join(", ")}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {roleAssignments.length + roleAgenda.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

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
            <CardTitle>Meeting agenda</CardTitle>
            <CardDescription>Current and carried-over agenda items.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {agendaItems.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.responsibility}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
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
