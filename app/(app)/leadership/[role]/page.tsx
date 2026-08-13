import { notFound } from "next/navigation";
import { ClipboardList, NotebookTabs, Plus, ShieldCheck } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeatWork } from "@/lib/data";
import { getSeat } from "@/lib/identity";
import { formatDate } from "@/lib/utils";

/*
  generateStaticParams used to prerender one page per seat from the seed array.
  Removed: seats live in Postgres now, and every route in this group reads the
  session cookie, so none of them can be static regardless.
*/

export default async function LeadershipPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: roleParam } = await params;
  const seat = await getSeat(roleParam);

  if (!seat) {
    notFound();
  }

  const holder = seat.holder;
  const work = getSeatWork(seat.id);

  const committed = work.commitments.filter((item) => item.state === "committed");
  const onAgenda = work.commitments.filter(
    (item) => item.state === "on_agenda" || item.state === "proposed",
  );
  const activeCount = work.commitments.length + work.gaps.length;

  return (
    <>
      <PageHeading
        title={holder ? `${holder.name} · ${seat.title}` : seat.title}
        description={seat.summary}
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <NotebookTabs data-icon="inline-start" />
              Add agenda item
            </Button>
            <Button>
              <Plus data-icon="inline-start" />
              Add commitment
            </Button>
          </div>
        }
      />

      <section className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calling scope</CardTitle>
            <CardDescription>Responsibilities attached to this seat.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {seat.responsibilities.map((responsibility) => (
              <div key={responsibility} className="rounded-md border border-border px-3 py-2.5">
                <p className="text-[14px] font-medium">{responsibility}</p>
              </div>
            ))}
            <div className="mt-1 flex flex-wrap gap-1.5">
              {seat.areas.map((area) => (
                <Badge key={area} variant="outline">
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Handbook-informed focus</CardTitle>
            <CardDescription>
              Operational interpretation for wardOS, not a policy substitute.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {seat.handbookFocus.map((focus) => (
              <div
                key={focus}
                className="rounded-md border border-border px-3 py-2.5 text-[14px] leading-relaxed"
              >
                {focus}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Metric label="Active items" value={String(activeCount)} />
        <Metric label="Committed" value={String(committed.length)} />
        <Metric label="On agenda" value={String(onAgenda.length)} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Committed work</CardTitle>
            <CardDescription>Owned by this calling with a due date.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {committed.length ? (
              <ul className="divide-y divide-border border-t border-border">
                {committed.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium">{item.title}</p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {item.responsibility}
                        {item.dueDate ? (
                          <>
                            {" · due "}
                            <time dateTime={item.dueDate}>{formatDate(item.dueDate)}</time>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <StatusBadge status={item.state} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyMessage label="Nothing is committed to this calling right now." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda</CardTitle>
            <CardDescription>Proposed and on-agenda items for this calling.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {onAgenda.length ? (
              <ul className="divide-y divide-border border-t border-border">
                {onAgenda.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium">{item.title}</p>
                      {item.detail ? (
                        <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                          {item.detail}
                        </p>
                      ) : null}
                    </div>
                    <StatusBadge status={item.state} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyMessage label="No agenda items are attached to this calling." />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claimed gaps</CardTitle>
            <CardDescription>
              Computed from the records themselves. These close when the record fills.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {work.gaps.length ? (
              <ul className="divide-y divide-border border-t border-border">
                {work.gaps.map((gap) => (
                  <li key={gap.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <p className="min-w-0 text-[14px]">{gap.title}</p>
                    <StatusBadge status={gap.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyMessage label="This calling has not claimed any open gaps." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guardrails</CardTitle>
            <CardDescription>
              Boundaries for keeping wardOS operational rather than pastoral.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-[14px]">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck data-icon="" />
              Keep out of wardOS
            </div>
            {seat.guardrails.map((guardrail) => (
              <p
                key={guardrail}
                className="rounded-md border border-border px-3 py-2.5 leading-relaxed text-muted-foreground"
              >
                {guardrail}
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Bring to next presidency meeting</CardTitle>
          <CardDescription>
            A lightweight checklist for keeping this calling connected to agenda and follow-up.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Checklist
            icon={<ClipboardList data-icon="" />}
            title="Review committed work"
            text="Decide what is done, what should be carried, and what should be dropped."
          />
          <Checklist
            icon={<NotebookTabs data-icon="" />}
            title="Add agenda items"
            text="Capture operational questions before the bi-monthly presidency meeting."
          />
          <Checklist
            icon={<ShieldCheck data-icon="" />}
            title="Check sensitivity"
            text="Link out or summarise operationally when details become personal or confidential."
          />
        </CardContent>
      </Card>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="px-5 py-4">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <p data-numeric className="mt-1 text-[24px] font-semibold tracking-[-0.02em]">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function Checklist({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-md border border-border px-3 py-3 text-[14px]">
      <div className="flex items-center gap-2 font-medium">
        {icon}
        {title}
      </div>
      <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function EmptyMessage({ label }: { label: string }) {
  return (
    <p className="border-t border-border px-5 py-8 text-center text-[14px] text-muted-foreground">
      {label}
    </p>
  );
}
