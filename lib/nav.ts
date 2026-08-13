import { commitmentsForSeat, computeGaps, openCommitments } from "@/lib/data";
import type { ActiveSession } from "@/lib/identity";
import type { Area, SeatKey, SeatWithHolder } from "@/lib/types";

/*
  Builds the sidebar on the server.

  This used to be a module-scope constant inside components/app-shell.tsx, which
  could not survive seats moving to Postgres: a client component cannot query,
  and module-level code evaluates once at import, so the nav would have been
  frozen at build time.

  Icons are passed as string keys rather than components. A Server Component
  cannot hand a function to a Client Component, so the key is resolved back to a
  lucide icon on the other side of the boundary.
*/

export type IconKey =
  | "dashboard"
  | "president"
  | "counselor"
  | "secretary"
  | "liaison"
  | "meetings"
  | "lessons"
  | "service"
  | "cleaning"
  | "budget"
  | "program"
  | "signups"
  | "sources"
  | "admin";

export type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon: IconKey;
  badge: number | null;
};

export type NavGroup = { label: string; items: NavItem[] };

export type Nav = { groups: NavGroup[]; adminItem: NavItem | null };

const seatIcons: Record<SeatKey, IconKey> = {
  eqp: "president",
  eq1: "counselor",
  eq2: "counselor",
  eqs: "secretary",
  hc: "liaison",
};

/** Work-area nav entries, each gated on the area its seat may or may not reach. */
const areaItems: { href: string; label: string; icon: IconKey; area: Area }[] = [
  { href: "/meetings", label: "Meetings", icon: "meetings", area: "meetings" },
  { href: "/lessons", label: "Lessons", icon: "lessons", area: "lessons" },
  { href: "/service", label: "Service", icon: "service", area: "service" },
  { href: "/cleaning", label: "Cleaning", icon: "cleaning", area: "cleaning" },
  { href: "/budget", label: "Budget", icon: "budget", area: "budget" },
  { href: "/program", label: "Program", icon: "program", area: "program" },
  { href: "/signups", label: "Signups", icon: "signups", area: "signups" },
  { href: "/sources", label: "Sources", icon: "sources", area: "sources" },
];

const gapAreaForHref: Record<string, Area> = {
  "/lessons": "lessons",
  "/service": "service",
  "/cleaning": "cleaning",
  "/signups": "signups",
  "/program": "program",
};

/*
  Badge counts are derived from the model, never from status-string matching.
  A seat's badge is its open commitments; a work area's badge is the number of
  computed gaps in that area. Nothing here stores anything, so nothing here can
  disagree with the underlying records.
*/
function badgeFor(href: string): number | null {
  if (href.startsWith("/leadership/")) {
    const seatId = href.split("/").pop() as SeatKey;
    const count = commitmentsForSeat(seatId).length;
    return count > 0 ? count : null;
  }

  if (href === "/meetings") {
    const count = openCommitments().filter(
      (item) => item.state === "on_agenda" || item.state === "proposed",
    ).length;
    return count > 0 ? count : null;
  }

  const area = gapAreaForHref[href];
  if (!area) return null;

  const count = computeGaps().filter((gap) => gap.area === area).length;
  return count > 0 ? count : null;
}

export function buildNav(session: ActiveSession, seats: SeatWithHolder[]): Nav {
  const canReach = (area: Area) => session.areas.includes(area);

  const groups: NavGroup[] = [
    {
      label: "Command",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: "dashboard", badge: null },
      ],
    },
    {
      label: "EQ Leadership",
      // Not area-gated. Inside a workspace everyone sees everyone's work --
      // relevance is visual emphasis, not access control.
      items: seats.map((seat) => ({
        href: `/leadership/${seat.id}`,
        // The seat is permanent; the holder is whoever currently occupies it.
        label: seat.holder?.name ?? seat.title,
        description: seat.title,
        icon: seatIcons[seat.id],
        badge: badgeFor(`/leadership/${seat.id}`),
      })),
    },
    {
      label: "Work Areas",
      items: areaItems
        .filter((item) => canReach(item.area))
        .map((item) => ({
          href: item.href,
          label: item.label,
          icon: item.icon,
          badge: badgeFor(item.href),
        })),
    },
  ];

  // Admin needs both the area and the capability. The high councilor has
  // neither: he is a stake officer participating in ward operations, not an
  // administrator of them.
  const adminItem: NavItem | null =
    session.canAdminister && canReach("admin")
      ? {
          href: "/admin",
          label: "Admin",
          description: "Ward settings",
          icon: "admin",
          badge: null,
        }
      : null;

  return { groups, adminItem };
}
