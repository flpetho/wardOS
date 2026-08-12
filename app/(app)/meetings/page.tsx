import { Plus, RotateCcw, Send } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  carryOverCount,
  computeGaps,
  decisions,
  getHolder,
  getSeat,
  meetings,
  openCommitments,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";
import type { Commitment } from "@/lib/types";

export default function MeetingsPage() {
  const nextMeeting = meetings.find((meeting) => meeting.status === "open") ?? meetings[0];
  const open = openCommitments();

  /*
    The agenda builds itself. Nobody drafts it: open gaps, anything proposed
    since the last meeting, and items carried over from a previous agenda are
    all already here.
  */
  const gaps = computeGaps();
  const inbox = open.filter((item) => item.state === "proposed");
  const onAgenda = open.filter((item) => item.state === "on_agenda");
  const carried = open.filter((item) => carryOverCount(item) > 0);

  return (
    <>
      <PageHeading
        title="Meetings"
        description="Bi-monthly presidency meeting. The agenda assembles itself from open gaps, proposals, and carried-over work."
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus data-icon="inline-start" />
              Add item
            </Button>
            <Button>
              <Send data-icon="inline-start" />
              Start meeting
            </Button>
          </div>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>{nextMeeting.title}</CardTitle>
            <CardDescription>
              {nextMeeting.cadence} ·{" "}
              <time dateTime={nextMeeting.meetingDate}>
                {formatDate(nextMeeting.meetingDate, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ol className="divide-y divide-border border-t border-border">
              {nextMeeting.sections.map((section) => (
                <li key={section} className="px-5 py-2.5 text-[14px]">
                  {section}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <CardTitle>Current agenda</CardTitle>
                <CardDescription>Items prepared for this meeting.</CardDescription>
              </div>
              <span data-numeric className="text-[13px] text-muted-foreground">
                {onAgenda.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {onAgenda.length ? (
              <ul className="divide-y divide-border border-t border-border">
                {onAgenda.map((item) => (
                  <AgendaRow key={item.id} item={item} />
                ))}
              </ul>
            ) : (
              <Empty label="Nothing is on the agenda yet." />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Open gaps</CardTitle>
            <CardDescription>
              Computed from the records. These arrive on the agenda automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {gaps.length ? (
              <ul className="divide-y divide-border border-t border-border">
                {gaps.map((gap) => (
                  <li key={gap.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-[14px]">{gap.title}</p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {gap.claimedBy
                          ? `Claimed by ${getSeat(gap.claimedBy)?.title}`
                          : "Unclaimed"}
                      </p>
                    </div>
                    <StatusBadge status={gap.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty label="No open gaps." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Proposed since the last meeting.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {inbox.length ? (
              <ul className="divide-y divide-border border-t border-border">
                {inbox.map((item) => (
                  <AgendaRow key={item.id} item={item} />
                ))}
              </ul>
            ) : (
              <Empty label="Nothing new proposed." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carried over</CardTitle>
            <CardDescription>
              Derived from how many agendas an item has survived.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {carried.length ? (
              <ul className="divide-y divide-border border-t border-border">
                {carried.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <RotateCcw data-icon="" className="text-progress" />
                        <p className="text-[14px] font-medium">{item.title}</p>
                      </div>
                      <p data-numeric className="mt-0.5 text-[13px] text-progress">
                        Carried over {carryOverCount(item)}×
                      </p>
                    </div>
                    <StatusBadge status={item.state} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty label="Nothing has been carried." />
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent decisions</CardTitle>
          <CardDescription>
            Decisions are recorded separately from private or pastoral notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <ul className="divide-y divide-border border-t border-border">
            {decisions.map((decision) => {
              const seat = getSeat(decision.decidedBySeatId);
              return (
                <li key={decision.id} className="px-5 py-3">
                  <p className="text-[14px] font-medium">{decision.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                    {decision.detail}
                  </p>
                  <p className="mt-1.5 text-[12px] text-muted-foreground">
                    <time dateTime={decision.meetingDate}>
                      {formatDate(decision.meetingDate, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    {seat ? ` · recorded under ${seat.title}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}

function AgendaRow({ item }: { item: Commitment }) {
  const seat = getSeat(item.seatId);
  const holder = item.seatId ? getHolder(item.seatId) : null;

  return (
    <li className="flex items-start justify-between gap-3 px-5 py-3">
      <div className="min-w-0">
        <p className="text-[14px] font-medium">{item.title}</p>
        {item.detail ? (
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{item.detail}</p>
        ) : null}
        <p className="mt-1 text-[12px] text-muted-foreground">
          {seat ? `${holder?.name ?? seat.title} · ${seat.title}` : "Unassigned"}
          {item.responsibility ? ` · ${item.responsibility}` : ""}
        </p>
      </div>
      <StatusBadge status={item.state} />
    </li>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <p className="border-t border-border px-5 py-8 text-center text-[14px] text-muted-foreground">
      {label}
    </p>
  );
}
