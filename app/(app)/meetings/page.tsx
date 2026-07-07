import { Plus, RotateCcw, Send } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { agendaItems, assignments, decisions, leadershipRoles, meetings } from "@/lib/data";

export default function MeetingsPage() {
  const nextMeeting = meetings[0];
  const agendaInbox = agendaItems.filter((item) => item.status === "Proposed");
  const carriedOver = agendaItems.filter((item) => item.status === "Carried over");
  const activeAgenda = agendaItems.filter((item) => item.status === "On agenda");

  return (
    <>
      <PageHeading
        title="Meetings"
        description="Bi-monthly presidency meeting agenda, carry-over items, decisions, and action items."
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus data-icon="inline-start" />
              Add agenda item
            </Button>
            <Button>
              <Send data-icon="inline-start" />
              Start meeting
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>{nextMeeting.title}</CardTitle>
            <CardDescription>
              {nextMeeting.cadence} · next meeting {nextMeeting.meetingDate}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {nextMeeting.sections.map((section) => (
              <div key={section} className="rounded-md border p-3 text-sm font-medium">
                {section}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current agenda</CardTitle>
            <CardDescription>Items prepared for the next presidency meeting.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {activeAgenda.map((item) => (
              <AgendaRow key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Agenda inbox</CardTitle>
            <CardDescription>New items not yet placed on a meeting agenda.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {agendaInbox.map((item) => (
              <AgendaRow key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carry-over</CardTitle>
            <CardDescription>Items that should survive meeting to meeting.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {carriedOver.map((item) => (
              <AgendaRow key={item.id} item={item} icon={<RotateCcw />} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent decisions</CardTitle>
            <CardDescription>Decisions separated from private or pastoral notes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {decisions.map((decision) => (
              <div key={decision.id} className="rounded-md border p-3">
                <p className="font-medium">{decision.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{decision.detail}</p>
                <p className="mt-2 text-xs text-muted-foreground">{decision.meetingDate}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Action items from meetings</CardTitle>
          <CardDescription>Assignments created by meetings or needing meeting review.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {assignments.map((assignment) => {
            const role = leadershipRoles.find((item) => item.id === assignment.ownerRole);

            return (
              <div key={assignment.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {role?.navLabel} · {assignment.responsibility} · due {assignment.dueDate}
                    </p>
                  </div>
                  <StatusBadge status={assignment.status} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}

function AgendaRow({
  item,
  icon,
}: {
  item: (typeof agendaItems)[number];
  icon?: React.ReactNode;
}) {
  const role = leadershipRoles.find((leadershipRole) => leadershipRole.id === item.ownerRole);

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <p className="font-medium">{item.title}</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {role?.navLabel} · {item.responsibility} · {item.meetingDate}
      </p>
    </div>
  );
}
