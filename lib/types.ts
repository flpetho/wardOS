import type { StaticImageData } from "next/image";

/*
  Domain types for the core model. See
  docs/plans/2026-08-11-mental-model-design.md.

  Enumerated values are lowercase snake_case, matching the database exactly.
  Display labels live in components/status-badge.tsx so there is one mapping
  point rather than two vocabularies that drift.
*/

// ---------------------------------------------------------------------------
// Seats, people, memberships
// ---------------------------------------------------------------------------

/** The app's own modules. A seat is scoped to a subset of these. */
export type Area =
  | "lessons"
  | "service"
  | "cleaning"
  | "signups"
  | "program"
  | "budget"
  | "meetings"
  | "sources"
  | "admin";

export const ALL_AREAS: Area[] = [
  "lessons",
  "service",
  "cleaning",
  "signups",
  "program",
  "budget",
  "meetings",
  "sources",
  "admin",
];

export type SeatType = "presidency" | "secretary" | "liaison" | "specialist";

export type SeatKey = "eqp" | "eq1" | "eq2" | "eqs" | "hc";

/**
 * A calling. Permanent — people come and go, the seat does not. Work is owned
 * by a seat so a release transfers the whole queue with no reassignment step.
 */
export type Seat = {
  id: SeatKey;
  type: SeatType;
  title: string;
  navLabel: string;
  summary: string;
  /** Areas this seat can reach. Not "all" plus exceptions — always explicit. */
  areas: Area[];
  canAdminister: boolean;
  responsibilities: string[];
  handbookFocus: string[];
  guardrails: string[];
  sortOrder: number;
};

export type Person = {
  id: string;
  name: string;
  email?: string;
  /** Set once Clerk is wired. Clerk owns identity; it never owns callings. */
  clerkUserId?: string;
};

/** Which person occupies which seat, for which period. */
export type Membership = {
  id: string;
  personId: string;
  seatId: SeatKey;
  activeFrom: string;
  /** Null means currently serving. A release sets this date. */
  activeUntil: string | null;
};

export type SeatWithHolder = Seat & { holder: Person | null };

// ---------------------------------------------------------------------------
// Commitments — the merged assignment + agenda item
// ---------------------------------------------------------------------------

export type CommitmentState =
  | "proposed"
  | "on_agenda"
  | "committed"
  | "done"
  | "dropped";

export type SourceRef = {
  type: "lesson" | "cleaning" | "service" | "program" | "signup";
  id: string;
};

export type Commitment = {
  id: string;
  title: string;
  detail?: string;
  /** Owner. Null while a proposal has not been taken by anyone. */
  seatId: SeatKey | null;
  /**
   * Optionally the person who personally took this on. The seat still owns it;
   * this exists so a release flags personally-held work instead of silently
   * handing it to a successor with no context.
   */
  heldByPersonId?: string | null;
  state: CommitmentState;
  responsibility?: string;
  dueDate?: string | null;
  /** Set when promoted from a computed Gap. Closing the source closes this. */
  source?: SourceRef | null;
  /** Meetings this has appeared on. Carry-over is derived from the count. */
  appearances: string[];
};

/**
 * Computed from domain records, never stored. A Gap cannot drift from reality
 * because it *is* reality, read back.
 */
export type Gap = {
  id: string;
  title: string;
  area: Area;
  source: SourceRef;
  /** Whether anyone has already taken this on as a Commitment. */
  claimedBy: SeatKey | null;
  status: string;
};

// ---------------------------------------------------------------------------
// Domain records — the system of record
// ---------------------------------------------------------------------------

export type LessonStatus =
  | "needs_topic"
  | "needs_teacher"
  | "assigned"
  | "prepared"
  | "completed";

export type Lesson = {
  id: string;
  date: string;
  topic: string;
  sourceMaterial: string;
  teacher: string | null;
  backupTeacher: string | null;
  status: LessonStatus;
  notes: string;
};

export type ServiceStatus = "draft" | "open" | "filled" | "completed" | "archived";

export type ServiceOpportunity = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  seatId: SeatKey;
  responsibility: string;
  needed: string;
  status: ServiceStatus;
  signupFormId: string;
};

export type CleaningStatus =
  | "needs_families"
  | "partially_filled"
  | "filled"
  | "completed"
  | "archived";

export type CleaningAssignment = {
  id: string;
  cleaningDate: string;
  startTime: string;
  familiesNeeded: number;
  assignedFamilies: string[];
  confirmedFamilies: string[];
  status: CleaningStatus;
  signupFormId: string;
  seatId: SeatKey;
  responsibility: string;
};

export type SignupForm = {
  id: string;
  title: string;
  description: string;
  status: "open" | "closed";
  relatedType: "service" | "cleaning" | "activity";
  slots: { id: string; title: string; quantityNeeded: number; responses: string[] }[];
};

export type ProgramStatus = "draft" | "ready_for_review" | "published" | "archived";

/** Hymn number and title are set in different weights, so they are separate data. */
export type Hymn = { number: string; title: string };

/**
 * The middle of a sacrament meeting is the only part that genuinely varies:
 * speakers, hymns, and musical numbers interleave in an order the presidency
 * chooses. A flat set of named fields cannot express that sequence, so it is
 * a list. Everything around it is fixed by convention and stays named.
 */
export type ProgramSlot =
  | { kind: "speaker"; name: string }
  | { kind: "hymn"; label: string; hymn: Hymn }
  | { kind: "musical"; description: string };

export type ProgramAnnouncement = {
  id: string;
  title: string;
  body: string;
  linkUrl?: string;
  linkLabel?: string;
};

export type SundayProgram = {
  programDate: string;
  status: ProgramStatus;
  /**
   * Seasonal artwork, full-bleed at the top of the bulletin. Null renders a
   * marked placeholder at the same ratio so the layout is honest about what
   * is missing rather than quietly closing up.
   */
  heroImage?: StaticImageData | string | null;
  presiding: string;
  conducting: string;
  chorister: string;
  organist: string;
  openingHymn: Hymn;
  openingPrayer: string;
  wardBusiness: string;
  sacramentHymn: Hymn;
  speakingOrder: ProgramSlot[];
  closingHymn: Hymn;
  closingPrayer: string;
  announcements: ProgramAnnouncement[];
  upcomingEvents: string[];
  lessonSchedule: string;
};

/** Standing ward information printed on every bulletin. Not per-program data. */
export type WardMeetingInfo = {
  scheduleNote: string;
  broadcastNote: string;
};

export type Meeting = {
  id: string;
  title: string;
  meetingDate: string;
  cadence: string;
  status: "draft" | "open" | "completed";
  sections: string[];
  decisionIds: string[];
};

export type Decision = {
  id: string;
  title: string;
  detail: string;
  meetingDate: string;
  decidedBySeatId?: SeatKey;
};

// ---------------------------------------------------------------------------
// Budget, organizations, temple
// ---------------------------------------------------------------------------

export type BudgetCategory = {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  pending: number;
};

export type BudgetSummary = {
  year: number;
  totalAllocated: number;
  categories: BudgetCategory[];
};

export type WardOrganization = {
  id: string;
  name: string;
  shortName: string;
  status: "active" | "planned" | "later";
  leaderPlaceholder: string;
  description: string;
};

export type TempleClosure = {
  id: string;
  label: string;
  startDate: string;
  endDate?: string;
};

export type QuorumTempleNight = {
  date: string;
  time: string;
  coordinatorSeatId: SeatKey;
  note: string;
};

export type TempleInfo = {
  name: string;
  district: string;
  address: string;
  cityStateZip: string;
  photo: StaticImageData | string | null;
  photoCredit: string | null;
  officialUrl: string;
  regularHours: { days: string; hours: string }[];
  closures: TempleClosure[];
  nextQuorumTempleNight: QuorumTempleNight | null;
  hoursVerified: string;
};
