import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Image as ImageIcon, Radio } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { sundayProgram, wardMeetingInfo, workspace } from "@/lib/data";
import type { Hymn, ProgramSlot } from "@/lib/types";

/*
  The Sunday bulletin. This is the only surface in wardOS that is not an
  operations tool — a ward member who scanned a QR code in the foyer, reading
  on a phone. It is Read mode, so it carries its own typographic identity
  rather than the dashboard's.

  Built to the Ward Program Figma design. Set in DM Sans by the owner's choice
  (the source design uses Aktiv Grotesk); the Medium/Light weight pairing that
  the design depends on maps onto DM Sans 500/300.

  Ink is a single warm olive at two weights — the apparent lightness of values
  is weight, not colour. The two-part rule (short heavy dash, long hairline) is
  the design's signature and is reused for every section break.
*/

const INK = "#404231";

export default async function PublicProgramPage({
  params,
}: {
  params: Promise<{ wardSlug: string }>;
}) {
  const { wardSlug } = await params;

  // Previously this rendered the full program for ANY slug and ANY status.
  if (wardSlug !== workspace.slug) {
    notFound();
  }

  const program = sundayProgram;

  if (program.status !== "published") {
    return (
      <Bulletin>
        <Masthead date={program.programDate} />
        <p className="mt-10 text-[13px] font-light leading-relaxed">
          This week&rsquo;s program has not been published yet. Please check back closer to
          Sunday.
        </p>
      </Bulletin>
    );
  }

  return (
    <Bulletin>
      <Masthead date={program.programDate} />

      <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-2">
        <MeetingNote icon={<Clock />} text={wardMeetingInfo.scheduleNote} />
        <MeetingNote icon={<Radio />} text={wardMeetingInfo.broadcastNote} />
      </div>

      <Hero image={program.heroImage} />

      <SectionHeading>Sacrament Meeting:</SectionHeading>

      <div className="flex flex-col gap-[22px]">
        <Group>
          <Row label="Presiding" value={program.presiding} />
          <Row label="Conducting" value={program.conducting} />
          <Row label="Chorister" value={program.chorister} />
          <Row label="Organist" value={program.organist} />
        </Group>

        <SubHeading>Announcements</SubHeading>

        <Group>
          <HymnRow label="Opening Hymn" hymn={program.openingHymn} />
          <Row label="Opening Prayer" value={program.openingPrayer} />
        </Group>

        <SubHeading>Ward and Stake Business</SubHeading>
        {program.wardBusiness ? (
          <p className="-mt-[14px] text-[13px] font-light tracking-[-0.03em]">
            {program.wardBusiness}
          </p>
        ) : null}

        <Group>
          <HymnRow label="Sacrament Hymn" hymn={program.sacramentHymn} />
        </Group>

        <SubHeading>Administration of the Sacrament</SubHeading>

        <Group>
          {program.speakingOrder.map((slot, index) => (
            <SlotRow key={`${slot.kind}-${index}`} slot={slot} />
          ))}
        </Group>

        <Group>
          <HymnRow label="Closing Hymn" hymn={program.closingHymn} />
          <Row label="Closing Prayer" value={program.closingPrayer} />
        </Group>
      </div>

      <SectionHeading>Announcements:</SectionHeading>

      <div className="flex flex-col gap-7">
        {program.announcements.map((announcement) => (
          <div key={announcement.id}>
            <p className="text-[13px] font-medium tracking-[-0.03em]">
              {announcement.title}:
            </p>
            <p className="mt-1 text-[13px] font-light leading-[1.55] opacity-75">
              {announcement.body}
            </p>
            {announcement.linkUrl ? (
              <Link
                href={announcement.linkUrl}
                className="mt-3 inline-flex items-center rounded-full px-4 py-2 text-[12px] font-medium no-underline transition-opacity hover:opacity-80"
                style={{ backgroundColor: INK, color: "#ffffff" }}
              >
                {announcement.linkLabel ?? "Open"}
              </Link>
            ) : null}
          </div>
        ))}
      </div>

      {program.upcomingEvents.length ? (
        <>
          <SectionHeading>Coming Up:</SectionHeading>
          <ul className="flex flex-col gap-2">
            {program.upcomingEvents.map((event) => (
              <li key={event} className="text-[13px] font-light tracking-[-0.03em]">
                {event}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <footer className="mt-14 pb-10 text-[12px] font-light opacity-60">
        {workspace.name}
      </footer>
    </Bulletin>
  );
}

function Bulletin({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white" style={{ color: INK }}>
      {/*
        Single scrolling column, capped at 440px rather than the source
        design's 393px. The cap has to clear the widest phone or the
        full-bleed hero stops short of the screen edge: at 430px (iPhone Pro
        Max) a 393px cap left a 19px white sliver down each side. 440 covers
        every common handset, so the image reaches both edges on all of them.

        Above 440 the column stays capped and centres, which reads as a
        bulletin page. Letting the hero span the whole viewport on a laptop
        would put a 1500px-wide photo above a narrow text column.

        Top margin matches the source, where the masthead sits at y=100.
      */}
      <div className="mx-auto w-full max-w-[440px] px-[29px] pt-[100px]">{children}</div>
    </main>
  );
}

function Masthead({ date }: { date: string }) {
  return (
    <header>
      <h1 className="text-[30px] font-medium leading-[1.12] tracking-[-0.035em]">
        {workspace.name}
        <br />
        Sunday Bulletin
      </h1>
      <p className="mt-2 text-[14px] font-light tracking-[-0.02em] opacity-70">
        <time dateTime={date}>
          {formatDate(date, { month: "long", day: "numeric", year: "numeric" })}
        </time>
      </p>
    </header>
  );
}

/*
  Full-bleed seasonal artwork, 393x440 in the source design. The negative
  margin cancels the page gutter so the image reaches both edges.

  With no asset, this renders a placeholder at the same ratio rather than
  collapsing — the space is part of the composition, and an honest gap is
  better than a layout that silently pretends nothing is missing.
*/
function Hero({ image }: { image: StaticImageData | string | null | undefined }) {
  if (image) {
    return (
      <div className="relative -mx-[29px] mt-9 aspect-[393/440]">
        <Image src={image} alt="" fill sizes="393px" className="object-cover" priority />
      </div>
    );
  }

  return (
    <div
      className="-mx-[29px] mt-9 flex aspect-[393/440] flex-col items-center justify-center gap-2.5 border-y"
      style={{ borderColor: `${INK}26`, backgroundColor: `${INK}0a` }}
      role="img"
      aria-label="Seasonal artwork placeholder"
    >
      <ImageIcon className="size-6 opacity-30" aria-hidden />
      <p className="text-[12px] font-medium tracking-[-0.02em] opacity-45">Seasonal artwork</p>
      <p className="text-[11px] font-light opacity-35">Placeholder</p>
    </div>
  );
}

function MeetingNote({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="[&>svg]:size-[18px]" aria-hidden>
        {icon}
      </span>
      <p className="text-[11px] font-light leading-[1.45] opacity-75">{text}</p>
    </div>
  );
}

/* The design's signature: a short heavy dash, then a long hairline. */
function Rule() {
  return (
    <div className="flex items-center" aria-hidden>
      <span className="h-[3px] w-[18px]" style={{ backgroundColor: INK }} />
      <span className="h-px flex-1" style={{ backgroundColor: INK, opacity: 0.25 }} />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 className="mt-14 text-[26px] font-medium tracking-[-0.035em]">{children}</h2>
      <div className="mb-6 mt-5">
        <Rule />
      </div>
    </>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[16px] font-medium tracking-[-0.03em]">{children}</h3>;
}

/* Labels size to the widest label in their own group, as in the source design. */
function Group({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-[5px] text-[13px] tracking-[-0.03em]">
      {children}
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-medium">{label}:</dt>
      <dd className="font-light">{value}</dd>
    </>
  );
}

function HymnRow({ label, hymn }: { label: string; hymn: Hymn }) {
  return (
    <>
      <dt className="font-medium">{label}:</dt>
      <dd>
        <span className="font-medium">#{hymn.number}</span>{" "}
        <span className="font-light">/ {hymn.title}</span>
      </dd>
    </>
  );
}

function SlotRow({ slot }: { slot: ProgramSlot }) {
  if (slot.kind === "speaker") {
    return <Row label="Speaker" value={slot.name} />;
  }
  if (slot.kind === "musical") {
    return <Row label="Musical Number" value={slot.description} />;
  }
  return <HymnRow label={slot.label} hymn={slot.hymn} />;
}
