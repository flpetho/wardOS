import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";
import { openCommitments, templeInfo } from "@/lib/data";
import { getHolder, getSeat } from "@/lib/identity";

const isTempleWork = (responsibility: string | undefined) =>
  (responsibility ?? "").toLowerCase().includes("temple");

/*
  Rendered in two places by AppShell: the persistent right rail at xl and above,
  and the bottom of the mobile navigation drawer below that. It deliberately
  carries no outer border or radius — the container it sits in owns those, so
  the same component reads correctly in both.
*/
export async function TemplePanel() {
  // Pulled from the quorum's own work rather than maintained separately: any
  // commitment whose responsibility mentions the temple surfaces here.
  const templeWork = openCommitments().filter((item) => isTempleWork(item.responsibility));
  const templeNight = templeInfo.nextQuorumTempleNight;
  const coordinatorSeat = templeNight
    ? await getSeat(templeNight.coordinatorSeatId)
    : undefined;
  const coordinator = templeNight
    ? await getHolder(templeNight.coordinatorSeatId)
    : null;

  return (
    <div className="flex flex-col" aria-label="Temple information">
      {templeInfo.photo ? (
        <>
          <div className="relative aspect-[3/2] w-full bg-surface">
            <Image
              src={templeInfo.photo}
              alt={`${templeInfo.name} exterior`}
              fill
              sizes="(min-width: 1280px) 300px, 286px"
              placeholder="blur"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-0.5 px-4 pb-3.5 pt-4">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              {templeInfo.name}
            </h2>
            <p className="text-[13px] text-muted-foreground">{templeInfo.district}</p>
            {templeInfo.photoCredit ? (
              <p className="mt-1 text-[11px] text-muted-foreground">{templeInfo.photoCredit}</p>
            ) : null}
          </div>
        </>
      ) : (
        /* No photo: the name carries the header typographically, so it reads as
           a deliberate masthead rather than a broken image slot. */
        <div className="flex flex-col items-center gap-1 bg-surface px-5 py-8 text-center">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            {templeInfo.name}
          </h2>
          <p className="text-[13px] text-muted-foreground">{templeInfo.district}</p>
        </div>
      )}

      <Section title="Address">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {templeInfo.address}
          <br />
          {templeInfo.cityStateZip}
        </p>
      </Section>

      <Section title="Hours">
        <dl className="flex flex-col gap-1.5">
          {templeInfo.regularHours.map((entry) => (
            <div key={entry.days} className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] text-muted-foreground">{entry.days}</dt>
              <dd data-numeric className="shrink-0 text-[13px] font-medium text-foreground">
                {entry.hours}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Closures">
        {templeInfo.closures.length ? (
          <ul className="flex flex-col gap-1.5">
            {templeInfo.closures.map((closure) => (
              <li key={closure.id} className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-muted-foreground">{closure.label}</span>
                <span data-numeric className="shrink-0 text-[13px] font-medium text-foreground">
                  {formatDate(closure.startDate)}
                  {closure.endDate ? `–${formatDate(closure.endDate, { day: "numeric" })}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            None recorded. Check the official schedule before a session — closures are not
            tracked automatically.
          </p>
        )}
      </Section>

      {templeNight ? (
        <Section title="Next quorum temple night">
          <p className="text-[14px] font-medium text-foreground">
            <time dateTime={templeNight.date}>
              {formatDate(templeNight.date, { weekday: "long", month: "long", day: "numeric" })}
            </time>
            <span className="font-normal text-muted-foreground"> · {templeNight.time}</span>
          </p>
          {coordinatorSeat ? (
            <p className="mt-1 text-[13px] text-muted-foreground">
              Coordinated by {coordinator?.name ?? coordinatorSeat.title}
              {coordinator ? ` · ${coordinatorSeat.title}` : ""}
            </p>
          ) : null}
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {templeNight.note}
          </p>
        </Section>
      ) : null}

      {templeWork.length ? (
        <Section title="Quorum temple work">
          <ul className="flex flex-col gap-3">
            {templeWork.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-2">
                <span className="min-w-0 text-[13px] leading-snug text-foreground">
                  {item.title}
                </span>
                <StatusBadge status={item.state} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <div className="border-t border-border px-4 py-3.5">
        <Link
          href={templeInfo.officialUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Official schedule
          <ExternalLink data-icon="inline-end" />
        </Link>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
          Hours last checked{" "}
          <time dateTime={templeInfo.hoursVerified}>
            {formatDate(templeInfo.hoursVerified, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          . wardOS does not sync temple schedules — confirm on the official page.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border px-4 py-3.5">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}
