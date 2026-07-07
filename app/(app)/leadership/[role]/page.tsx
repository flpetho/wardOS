import { notFound } from "next/navigation";
import { ClipboardList, NotebookTabs, Plus } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getLeadershipRole,
  getLeadershipWork,
  leadershipRoles,
} from "@/lib/data";
import type { LeadershipRoleId } from "@/lib/types";

export function generateStaticParams() {
  return leadershipRoles.map((role) => ({ role: role.id }));
}

export default async function LeadershipPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: roleParam } = await params;
  const role = getLeadershipRole(roleParam);

  if (!role) {
    notFound();
  }

  const work = getLeadershipWork(role.id as LeadershipRoleId);
  const activeCount =
    work.assignments.length +
    work.agendaItems.length +
    work.serviceOpportunities.length +
    work.cleaningAssignments.length;

  return (
    <>
      <PageHeading
        title={`${role.navLabel} · ${role.title}`}
        description={`${role.person} · ${role.summary}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <NotebookTabs data-icon="inline-start" />
              Add agenda item
            </Button>
            <Button>
              <Plus data-icon="inline-start" />
              Add assignment
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calling scope</CardTitle>
            <CardDescription>Responsibilities currently attached to this role.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {role.responsibilities.map((responsibility) => (
              <div key={responsibility} className="rounded-md border p-3">
                <p className="font-medium">{responsibility}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role snapshot</CardTitle>
            <CardDescription>Everything assigned to this leadership role.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Metric label="Active items" value={String(activeCount)} />
            <Metric label="Agenda items" value={String(work.agendaItems.length)} />
            <Metric label="Assignments" value={String(work.assignments.length)} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assignments and duties</CardTitle>
            <CardDescription>Role-owned work that needs follow-up.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {work.assignments.length ? (
              work.assignments.map((assignment) => (
                <div key={assignment.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.responsibility} · due {assignment.dueDate}
                      </p>
                    </div>
                    <StatusBadge status={assignment.status} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyMessage label="No assignments are owned by this role yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting agenda</CardTitle>
            <CardDescription>Submitted, carried-over, or active agenda items.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {work.agendaItems.length ? (
              work.agendaItems.map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.responsibility} · {item.meetingDate}
                  </p>
                </div>
              ))
            ) : (
              <EmptyMessage label="No agenda items are assigned to this role yet." />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Relevant service</CardTitle>
            <CardDescription>Service opportunities connected to this role.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {work.serviceOpportunities.length ? (
              work.serviceOpportunities.map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{item.title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.needed} · {item.date}
                  </p>
                </div>
              ))
            ) : (
              <EmptyMessage label="No service items are attached to this role." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating notes</CardTitle>
            <CardDescription>Lightweight role context for presidency meetings.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2">
              <ClipboardList />
              <p className="font-medium">Bring to next meeting</p>
            </div>
            <p className="text-muted-foreground">
              Review open assignments, decide which agenda items should carry over, and add
              any new role-specific items before the next bi-monthly meeting.
            </p>
            <div className="flex flex-wrap gap-2">
              {role.responsibilities.map((responsibility) => (
                <Badge key={responsibility} variant="outline">
                  {responsibility}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function EmptyMessage({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      {label}
    </div>
  );
}
