import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { seatCopy } from "@/lib/data";
import type { Area, Person, Seat, SeatKey, SeatType, SeatWithHolder } from "@/lib/types";

/*
  Identity: who is signed in, which seat they hold, and what that seat can reach.

  These four tables (workspaces, people, seats, memberships) are the only ones
  read from Postgres today. Every domain record still comes from lib/data.ts.

  A Supabase session on its own grants nothing. Access requires a `people` row
  whose email matches the signed-in address AND a membership with no end date.
  The guest list is ward data, never the auth provider's user list -- the same
  principle that keeps callings out of the identity system.

  Every export is wrapped in React's cache(), so a page, its layout and any
  component may each ask for the session and still cost one round trip per
  request.
*/

/** `name` is the ward; `organization` is which organisation within it. */
export type Workspace = {
  id: string;
  name: string;
  slug: string;
  organization: string | null;
};

export type ActiveSession = {
  person: Person;
  seat: Seat;
  workspace: Workspace;
  /** Convenience mirrors of seat fields; every access check reads these. */
  areas: Area[];
  canAdminister: boolean;
};

const SEAT_COLUMNS =
  "id, key, title, nav_label, seat_type, areas, can_administer, summary, sort_order";

type SeatRow = {
  id: string;
  key: string;
  title: string;
  nav_label: string;
  seat_type: string;
  areas: string[] | null;
  can_administer: boolean;
  summary: string | null;
  sort_order: number;
};

type PersonRow = { id: string; name: string; email: string | null };

const SEAT_KEYS: SeatKey[] = ["eqp", "eq1", "eq2", "eqs", "hc"];

function isSeatKey(value: string): value is SeatKey {
  return (SEAT_KEYS as string[]).includes(value);
}

/**
 * Merges the database row with the editorial copy in lib/data.ts.
 *
 * The split is deliberate: the database owns what decides access (areas,
 * can_administer) so it cannot drift from what the policies enforce, while
 * prose that is only ever displayed stays in code where it is easier to edit
 * and has no schema to migrate.
 */
function toSeat(row: SeatRow): Seat | null {
  if (!isSeatKey(row.key)) return null;
  const copy = seatCopy[row.key];

  return {
    id: row.key,
    type: row.seat_type as SeatType,
    title: row.title,
    navLabel: row.nav_label,
    summary: row.summary ?? "",
    areas: (row.areas ?? []) as Area[],
    canAdminister: row.can_administer,
    responsibilities: copy.responsibilities,
    handbookFocus: copy.handbookFocus,
    guardrails: copy.guardrails,
    sortOrder: row.sort_order,
  };
}

function toPerson(row: PersonRow): Person {
  return { id: row.id, name: row.name, email: row.email ?? undefined };
}

/**
 * The signed-in person, their seat, and their workspace. Null in three cases,
 * kept separable in the code below even though they present identically:
 * not signed in, signed in but on no `people` row, or on one with no current
 * membership (released, or never seated).
 */
export const getActiveSession = cache(async (): Promise<ActiveSession | null> => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Resolves the JWT email to a person, case-insensitively, in the database
  // rather than here -- the same function the RLS policies use, so the app and
  // the policies can never disagree about who you are.
  const { data: personId } = await supabase.rpc("current_person_id");
  if (!personId) return null;

  const { data } = await supabase
    .from("memberships")
    .select(
      `id,
       person:people ( id, name, email ),
       seat:seats ( ${SEAT_COLUMNS} ),
       workspace:workspaces ( id, name, slug, organization )`,
    )
    .eq("person_id", personId)
    .is("active_until", null)
    // A person may hold seats in several workspaces -- the high councilor case.
    // Until a workspace switcher exists, the lowest-sorted seat wins, which is
    // deterministic rather than merely first-returned.
    .order("active_from", { ascending: true })
    .limit(1)
    .maybeSingle();

  const row = data as unknown as {
    person: PersonRow | null;
    seat: SeatRow | null;
    workspace: Workspace | null;
  } | null;

  if (!row?.person || !row.seat || !row.workspace) return null;

  const seat = toSeat(row.seat);
  if (!seat) return null;

  return {
    person: toPerson(row.person),
    seat,
    workspace: row.workspace,
    areas: seat.areas,
    canAdminister: seat.canAdminister,
  };
});

/**
 * Every seat in the workspace with whoever currently holds it. Drives the
 * sidebar and the leadership pages.
 *
 * Row level security scopes this to workspaces the caller belongs to, so an
 * unauthorised caller gets an empty list rather than an error.
 */
export const getSeatsWithHolders = cache(async (): Promise<SeatWithHolder[]> => {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("seats")
    .select(
      `${SEAT_COLUMNS},
       memberships ( active_until, person:people ( id, name, email ) )`,
    )
    // Filtering the embedded resource keeps every seat but only its current
    // holder, so a seat sitting vacant between sustainings still renders.
    .is("memberships.active_until", null)
    .order("sort_order", { ascending: true });

  const rows = (data ?? []) as unknown as (SeatRow & {
    memberships: { person: PersonRow | null }[];
  })[];

  const seats: SeatWithHolder[] = [];
  for (const row of rows) {
    const seat = toSeat(row);
    if (!seat) continue;
    const holder = row.memberships?.[0]?.person ?? null;
    seats.push({ ...seat, holder: holder ? toPerson(holder) : null });
  }
  return seats;
});

export async function getSeat(seatId: string | null | undefined) {
  if (!seatId) return undefined;
  const seats = await getSeatsWithHolders();
  return seats.find((seat) => seat.id === seatId);
}

/** The person currently occupying a seat, or null between sustainings. */
export async function getHolder(seatId: SeatKey): Promise<Person | null> {
  const seat = await getSeat(seatId);
  return seat?.holder ?? null;
}

/**
 * Whether a seat may reach an area.
 *
 * Hiding a nav item is presentation; this is the check that has to run on the
 * server before a page renders. A hidden link that still serves its page on
 * direct navigation is a leak, not a permission.
 */
export function seatCanAccess(seat: Seat | null | undefined, area: Area) {
  return seat ? seat.areas.includes(area) : false;
}
