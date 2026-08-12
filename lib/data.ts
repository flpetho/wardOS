import gilbertTemplePhoto from "@/img/gilbert-az-temple.png";
import {
  ALL_AREAS,
  type Area,
  type BudgetSummary,
  type CleaningAssignment,
  type Commitment,
  type Decision,
  type Gap,
  type Lesson,
  type Meeting,
  type Membership,
  type Person,
  type Seat,
  type SeatKey,
  type SeatWithHolder,
  type ServiceOpportunity,
  type SignupForm,
  type SundayProgram,
  type TempleInfo,
  type WardOrganization,
} from "@/lib/types";

/*
  Seed data for the core model. See docs/plans/2026-08-11-mental-model-design.md.

  EVERY NAME HERE IS FICTIONAL except Ferenc Petho, the product owner. Nothing
  in this file describes a real ward, and none of it may reach production.
*/

export const workspace = {
  name: "Oak Hills Ward",
  slug: process.env.NEXT_PUBLIC_WARD_SLUG || "oak-hills",
};

// ---------------------------------------------------------------------------
// People and seats
// ---------------------------------------------------------------------------

export const people: Person[] = [
  { id: "person-nathan", name: "Nathan Placeholder" },
  { id: "person-ferenc", name: "Ferenc Petho" },
  { id: "person-marcus", name: "Marcus Placeholder" },
  { id: "person-caleb", name: "Caleb Placeholder" },
  { id: "person-david", name: "David Placeholder" },
];

/** Stewards reach everything. The liaison seat is scoped away from budget. */
const stewardAreas: Area[] = ALL_AREAS;
const liaisonAreas: Area[] = ALL_AREAS.filter(
  (area) => area !== "budget" && area !== "admin",
);

export const seats: Seat[] = [
  {
    id: "eqp",
    type: "presidency",
    title: "President",
    navLabel: "President",
    summary:
      "Coordinates quorum direction, bishopric alignment, ministering oversight, and presidency decisions.",
    areas: stewardAreas,
    canAdminister: true,
    responsibilities: [
      "Presidency priorities",
      "Bishopric coordination",
      "Ministering oversight",
      "Sunday quorum meetings",
      "Quorum member interviews",
    ],
    handbookFocus: [
      "Lead the quorum's participation in the work of salvation and exaltation.",
      "Coordinate ministering assignments with the Relief Society presidency.",
      "Plan and conduct quorum meetings and oversee teaching.",
      "Counsel with ward leaders while leaving worthiness, abuse, and fast-offering approval matters with the bishop.",
    ],
    guardrails: [
      "Do not store worthiness, abuse, financial, or private counseling notes.",
      "Ministering details should be tracked as operational follow-up, not sensitive family records.",
    ],
    sortOrder: 1,
  },
  {
    id: "eq1",
    type: "presidency",
    title: "First Counselor",
    navLabel: "First Counselor",
    summary:
      "Owns Family History and Service Assignments, with agenda items and follow-up work grouped here.",
    areas: stewardAreas,
    canAdminister: true,
    responsibilities: [
      "Temple and Family History",
      "Service Assignments",
      "Short-term needs coordination",
      "Quorum invitations",
    ],
    handbookFocus: [
      "Help members participate in temple and family history work.",
      "Coordinate with Relief Society leaders where service and short-term needs overlap.",
      "Use presidency meetings to discuss how brethren can participate in family history and service.",
      "Keep service coordination practical and avoid turning the app into a sensitive needs database.",
    ],
    guardrails: [
      "Track volunteer coordination, owners, and dates, not private circumstances behind a need.",
      "Link out to sensitive sources instead of copying personal details into wardOS.",
    ],
    sortOrder: 2,
  },
  {
    id: "eq2",
    type: "presidency",
    title: "Second Counselor",
    navLabel: "Second Counselor",
    summary:
      "Owns lessons, activities support, and cleaning coordination until the presidency refines domains.",
    areas: stewardAreas,
    canAdminister: true,
    responsibilities: [
      "Gospel instruction",
      "Activities",
      "Cleaning Assignments",
      "Teaching improvement",
    ],
    handbookFocus: [
      "Help plan quorum meetings around faith, unity, families, and ward work.",
      "Support meaningful gospel instruction using recent general conference messages.",
      "Plan activities that help brethren gather, serve, and strengthen covenant living.",
      "Keep activity and cleaning work operational and visible.",
    ],
    guardrails: [
      "Lesson notes should stay about teaching plans, not private member concerns.",
      "Activities should remain simple coordination unless a richer planning module is needed.",
    ],
    sortOrder: 3,
  },
  {
    id: "eqs",
    type: "secretary",
    title: "Secretary",
    navLabel: "Secretary",
    summary:
      "Owns meeting notes, agenda hygiene, action item tracking, and source links.",
    areas: stewardAreas,
    canAdminister: true,
    responsibilities: [
      "Meeting notes",
      "Action item tracking",
      "Records and reports",
      "Source hygiene",
    ],
    handbookFocus: [
      "Help the presidency keep records, reports, finances, agendas, and follow-up organized.",
      "Separate decisions and operational assignments from confidential notes.",
      "Keep carried-over agenda items visible until they are decided, assigned, or archived.",
      "Maintain links to source material without importing sensitive content by default.",
    ],
    guardrails: [
      "Meeting notes should capture operational decisions and action items, not private pastoral counseling.",
      "Sensitive sources remain link-only until intentionally reviewed.",
    ],
    sortOrder: 4,
  },
  {
    id: "hc",
    type: "liaison",
    title: "Stake High Councilor",
    navLabel: "High Councilor",
    summary:
      "Stake officer assigned to the quorum. Participates in presidency meetings and carries work back to the stake.",
    areas: liaisonAreas,
    canAdminister: false,
    responsibilities: ["Stake liaison", "Meeting participation", "Stake follow-up"],
    handbookFocus: [
      "Represent the stake presidency in quorum presidency meetings.",
      "Carry quorum needs and questions back to the stake council.",
      "Support the quorum presidency without directing ward-level operations.",
    ],
    guardrails: [
      "Does not administer the workspace and cannot see the quorum budget.",
      "Stake matters stay with the stake; ward operational detail stays with the presidency.",
    ],
    sortOrder: 5,
  },
];

/** Null activeUntil means currently serving. A release sets that date. */
export const memberships: Membership[] = [
  { id: "m-1", personId: "person-nathan", seatId: "eqp", activeFrom: "2025-03-02", activeUntil: null },
  { id: "m-2", personId: "person-ferenc", seatId: "eq1", activeFrom: "2025-03-02", activeUntil: null },
  { id: "m-3", personId: "person-marcus", seatId: "eq2", activeFrom: "2025-03-02", activeUntil: null },
  { id: "m-4", personId: "person-caleb", seatId: "eqs", activeFrom: "2025-06-15", activeUntil: null },
  { id: "m-5", personId: "person-david", seatId: "hc", activeFrom: "2026-01-11", activeUntil: null },
];

// ---------------------------------------------------------------------------
// Domain records — the system of record
// ---------------------------------------------------------------------------

export const lessons: Lesson[] = [
  {
    id: "lesson-1",
    date: "2026-07-12",
    topic: "Becoming One in Christ",
    sourceMaterial: "General Conference address",
    teacher: "Daniel Kim",
    backupTeacher: "Marcus Lee",
    status: "prepared",
    notes: "Use discussion format and leave five minutes for quorum invitations.",
  },
  {
    id: "lesson-2",
    date: "2026-07-26",
    topic: "Ministering Through Small Acts",
    sourceMaterial: "Come, Follow Me + conference excerpt",
    // Empty teacher is the ONLY record of this gap. Nothing else stores it.
    teacher: null,
    backupTeacher: null,
    status: "needs_teacher",
    notes: "Confirm teacher before presidency meeting.",
  },
  {
    id: "lesson-3",
    date: "2026-08-09",
    topic: "Covenant Confidence",
    sourceMaterial: "Elders quorum presidency selection",
    teacher: "Jose Ramirez",
    backupTeacher: null,
    status: "assigned",
    notes: "Add source link when final talk is selected.",
  },
];

export const serviceOpportunities: ServiceOpportunity[] = [
  {
    id: "service-1",
    title: "Move assistance for the Porters",
    description: "Load boxes and furniture into a rented truck.",
    date: "2026-07-18",
    location: "Porter home",
    seatId: "eq1",
    responsibility: "Service Assignments",
    needed: "6 volunteers",
    status: "open",
    signupFormId: "move-assistance",
  },
  {
    id: "service-2",
    title: "Youth activity setup",
    description: "Set up tables, chairs, and outdoor shade before the activity.",
    date: "2026-07-22",
    location: "Meetinghouse cultural hall",
    seatId: "eq1",
    responsibility: "Service Assignments",
    needed: "4 volunteers",
    status: "draft",
    signupFormId: "activity-setup",
  },
];

export const cleaningAssignments: CleaningAssignment[] = [
  {
    id: "cleaning-1",
    cleaningDate: "2026-07-11",
    startTime: "8:00 AM",
    familiesNeeded: 4,
    assignedFamilies: ["Anderson", "Miller"],
    confirmedFamilies: ["Anderson"],
    status: "partially_filled",
    signupFormId: "july-11-cleaning",
    seatId: "eq2",
    responsibility: "Cleaning Assignments",
  },
  {
    id: "cleaning-2",
    cleaningDate: "2026-07-25",
    startTime: "8:00 AM",
    familiesNeeded: 4,
    assignedFamilies: [],
    confirmedFamilies: [],
    status: "needs_families",
    signupFormId: "july-25-cleaning",
    seatId: "eq2",
    responsibility: "Cleaning Assignments",
  },
];

export const signupForms: SignupForm[] = [
  {
    id: "move-assistance",
    title: "Move assistance for the Porters",
    description: "Sign up for a time slot. Public form collects name only.",
    status: "open",
    relatedType: "service",
    slots: [
      { id: "slot-1", title: "8:00 AM loading crew", quantityNeeded: 4, responses: ["Evan"] },
      { id: "slot-2", title: "10:00 AM unloading crew", quantityNeeded: 4, responses: ["Caleb", "Sam"] },
    ],
  },
  {
    id: "july-11-cleaning",
    title: "Meetinghouse cleaning - July 11",
    description: "Saturday cleaning signup for the ward building.",
    status: "open",
    relatedType: "cleaning",
    slots: [
      { id: "slot-3", title: "Bathrooms and entry", quantityNeeded: 1, responses: ["Anderson"] },
      { id: "slot-4", title: "Classrooms", quantityNeeded: 2, responses: [] },
      { id: "slot-5", title: "Vacuum chapel", quantityNeeded: 1, responses: [] },
    ],
  },
];

export const sundayProgram: SundayProgram = {
  programDate: "2026-07-12",
  status: "published",
  presiding: "Bishop Nathan Cole",
  conducting: "Brother Ethan Ward",
  openingHymn: "Hymn 85 - How Firm a Foundation",
  openingPrayer: "By invitation",
  wardBusiness: "Sustaining and releases as needed",
  sacramentHymn: "Hymn 193 - I Stand All Amazed",
  speakers: ["Sister Lauren Hayes", "Brother Daniel Kim"],
  intermediateHymn: "Youth musical number",
  closingHymn: "Hymn 220 - Lord, I Would Follow Thee",
  closingPrayer: "By invitation",
  announcements: [
    "Ward service project next Saturday morning.",
    "Temple recommend interviews are available after the block.",
  ],
  upcomingEvents: [
    "Jul 18 - Move assistance service project",
    "Jul 22 - Youth activity setup",
    "Jul 25 - Meetinghouse cleaning",
  ],
  lessonSchedule: "Elders Quorum: Becoming One in Christ, taught by Daniel Kim",
};

// ---------------------------------------------------------------------------
// Meetings, decisions, commitments
// ---------------------------------------------------------------------------

export const meetings: Meeting[] = [
  {
    id: "meeting-0",
    title: "EQ Presidency Meeting",
    meetingDate: "2026-06-30",
    cadence: "Bi-monthly",
    status: "completed",
    sections: [],
    decisionIds: ["decision-1"],
  },
  {
    id: "meeting-1",
    title: "EQ Presidency Meeting",
    meetingDate: "2026-07-14",
    cadence: "Bi-monthly",
    status: "open",
    sections: [
      "Opening",
      "Carry-over items",
      "Living the Gospel",
      "Caring for Those in Need",
      "Inviting All to Receive the Gospel",
      "Uniting Families for Eternity",
      "Sunday Quorum Meetings",
      "Ministering",
      "Service Assignments",
      "Cleaning",
      "Sunday Program",
      "New assignments",
      "Decisions",
    ],
    decisionIds: [],
  },
];

export const decisions: Decision[] = [
  {
    id: "decision-1",
    title: "Keep sensitive tabs link-only",
    detail: "No row-level data from Visit List or Ministering Assignments in v0.",
    meetingDate: "2026-06-30",
    decidedBySeatId: "eqp",
  },
];

/*
  Commitments replace the old `assignments` and `agendaItems` arrays.

  Two former agenda items are gone entirely: "Porter move coverage" and
  "July 26 teacher still needed" were duplicates of Gaps already computable
  from the signup and lesson records. That duplication is exactly what this
  model exists to remove.
*/
export const commitments: Commitment[] = [
  {
    id: "c-1",
    title: "Confirm July 26 teacher",
    seatId: "eq2",
    state: "committed",
    responsibility: "Gospel instruction",
    dueDate: "2026-07-10",
    source: { type: "lesson", id: "lesson-2" },
    appearances: ["meeting-1"],
  },
  {
    id: "c-2",
    title: "Review cleaning signup after Sunday",
    seatId: "eqs",
    state: "committed",
    responsibility: "Action item tracking",
    dueDate: "2026-07-13",
    source: null,
    appearances: ["meeting-1"],
  },
  {
    id: "c-3",
    title: "Publish Sunday program",
    seatId: "eqp",
    state: "committed",
    responsibility: "Sunday readiness",
    dueDate: "2026-07-11",
    source: { type: "program", id: "2026-07-12" },
    appearances: ["meeting-1"],
  },
  {
    id: "c-4",
    title: "Draft temple and family history invitation for quorum",
    seatId: "eq1",
    state: "committed",
    responsibility: "Temple and Family History",
    dueDate: "2026-07-20",
    source: null,
    appearances: ["meeting-1"],
  },
  {
    id: "c-5",
    title: "Find two more volunteers for Porter move",
    detail: "Carry over until the signup has six confirmed volunteers. Keep notes limited to logistics.",
    seatId: "eq1",
    // Personally held: Ferenc knows Brother Porter from work. On release this
    // is flagged rather than silently handed to his successor.
    heldByPersonId: "person-ferenc",
    state: "committed",
    responsibility: "Service Assignments",
    dueDate: "2026-07-16",
    source: { type: "signup", id: "move-assistance" },
    appearances: ["meeting-0", "meeting-1"],
  },
  {
    id: "c-6",
    title: "Temple and family history Sunday invitation",
    detail: "Decide whether to invite a ward family history consultant into quorum for five minutes.",
    seatId: "eq1",
    state: "on_agenda",
    responsibility: "Temple and Family History",
    source: null,
    appearances: ["meeting-1"],
  },
  {
    id: "c-7",
    title: "Meeting notes format",
    detail: "Standardize decisions, action items, and carry-over notes.",
    seatId: "eqs",
    state: "on_agenda",
    responsibility: "Meeting notes",
    source: null,
    // Two appearances while still open — this is what "carried over" now means.
    appearances: ["meeting-0", "meeting-1"],
  },
  {
    id: "c-8",
    title: "Ministering interview cadence",
    detail: "Review quarterly interview coverage without storing private ministering details.",
    seatId: "eqp",
    state: "on_agenda",
    responsibility: "Ministering oversight",
    source: null,
    appearances: ["meeting-1"],
  },
  {
    id: "c-9",
    title: "Sensitive source treatment",
    detail: "Agree whether Visit List and Ministering Assignments stay link-only.",
    seatId: "eqp",
    state: "proposed",
    responsibility: "Presidency priorities",
    source: null,
    appearances: [],
  },
  {
    id: "c-10",
    title: "Five-minute quorum counsel topic",
    detail: "Choose the Sunday counseling topic around a relevant ward need or opportunity.",
    seatId: "eq2",
    state: "proposed",
    responsibility: "Gospel instruction",
    source: null,
    appearances: [],
  },
];

// ---------------------------------------------------------------------------
// Budget, organizations, sources, temple
// ---------------------------------------------------------------------------

export const budgetSummary: BudgetSummary = {
  year: 2026,
  totalAllocated: 2400,
  categories: [
    { id: "budget-activities", name: "Activities", allocated: 900, spent: 420, pending: 120 },
    { id: "budget-service", name: "Service", allocated: 650, spent: 185, pending: 75 },
    { id: "budget-lessons", name: "Lessons and supplies", allocated: 350, spent: 90, pending: 0 },
    { id: "budget-admin", name: "Admin and printing", allocated: 500, spent: 210, pending: 45 },
  ],
};

export const wardOrganizations: WardOrganization[] = [
  {
    id: "elders-quorum",
    name: "Elders Quorum",
    shortName: "EQ",
    status: "active",
    leaderPlaceholder: "Nathan Placeholder",
    description:
      "Current operating workspace for presidency work, meetings, assignments, service, and Sunday readiness.",
  },
  {
    id: "relief-society",
    name: "Relief Society",
    shortName: "RS",
    status: "planned",
    leaderPlaceholder: "Relief Society President",
    description: "Future operating view for Relief Society presidency coordination and shared ward work.",
  },
  {
    id: "young-men",
    name: "Young Men",
    shortName: "YM",
    status: "planned",
    leaderPlaceholder: "Young Men President",
    description: "Future youth leadership coordination and activities view.",
  },
  {
    id: "young-women",
    name: "Young Women",
    shortName: "YW",
    status: "planned",
    leaderPlaceholder: "Young Women President",
    description: "Future youth leadership coordination and activities view.",
  },
  {
    id: "primary",
    name: "Primary",
    shortName: "Primary",
    status: "planned",
    leaderPlaceholder: "Primary President",
    description: "Future Primary presidency planning and operational coordination.",
  },
  {
    id: "bishopric",
    name: "Bishopric Master View",
    shortName: "Bishopric",
    status: "later",
    leaderPlaceholder: "Bishopric",
    description:
      "Future master view across organizations, with strict boundaries around confidential bishopric matters.",
  },
];

export const sources = [
  { title: "Lesson Schedule for the Year", type: "Google Sheet tab", sensitivity: "safe", treatment: "Imported into Lessons" },
  { title: "Service Assignments", type: "Google Sheet tab", sensitivity: "safe", treatment: "Imported into Service" },
  { title: "Cleaning Assignments", type: "Google Sheet tab", sensitivity: "safe", treatment: "Imported into Cleaning" },
  { title: "Visit List", type: "Google Sheet tab", sensitivity: "sensitive", treatment: "Link only" },
  { title: "Ministering Assignments", type: "Google Sheet tab", sensitivity: "sensitive", treatment: "Link only" },
];

/*
  Hours came from public third-party listings, not from the official page, so
  they carry a visible verification date and a link out. Closures are empty
  because no source published them, and invented closure dates would send
  someone to a closed temple.
*/
export const templeInfo: TempleInfo = {
  name: "Gilbert Arizona Temple",
  district: "Gilbert Arizona Temple District",
  address: "3301 S Greenfield Rd",
  cityStateZip: "Gilbert, AZ 85297",
  photo: gilbertTemplePhoto,
  photoCredit: null,
  officialUrl:
    "https://www.churchofjesuschrist.org/temples/details/gilbert-arizona-temple?lang=eng",
  regularHours: [
    { days: "Tuesday – Saturday", hours: "5:00 AM – 10:00 PM" },
    { days: "Sunday & Monday", hours: "Closed" },
  ],
  closures: [],
  nextQuorumTempleNight: {
    date: "2026-07-17",
    time: "6:00 PM",
    coordinatorSeatId: "eq1",
    note: "Meet in the north parking lot. Rides available for anyone who needs one.",
  },
  hoursVerified: "2026-08-11",
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getSeat(seatId: string | null | undefined) {
  return seats.find((seat) => seat.id === seatId);
}

export function getPerson(personId: string | null | undefined) {
  return people.find((person) => person.id === personId);
}

/** The person currently occupying a seat, or null between sustainings. */
export function getHolder(seatId: SeatKey): Person | null {
  const membership = memberships.find(
    (item) => item.seatId === seatId && item.activeUntil === null,
  );
  return membership ? getPerson(membership.personId) ?? null : null;
}

export function getSeatsWithHolders(): SeatWithHolder[] {
  return [...seats]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((seat) => ({ ...seat, holder: getHolder(seat.id) }));
}

export function canSeatAccess(seatId: SeatKey | null | undefined, area: Area) {
  const seat = getSeat(seatId);
  return seat ? seat.areas.includes(area) : false;
}

export function getSignupForm(formId: string) {
  return signupForms.find((form) => form.id === formId);
}

// ---------------------------------------------------------------------------
// Commitments
// ---------------------------------------------------------------------------

const OPEN_STATES: Commitment["state"][] = ["proposed", "on_agenda", "committed"];

export function openCommitments() {
  return commitments.filter((item) => OPEN_STATES.includes(item.state));
}

export function commitmentsForSeat(seatId: SeatKey) {
  return openCommitments().filter((item) => item.seatId === seatId);
}

/**
 * Carry-over is derived, never stored: an item that has appeared on more than
 * one meeting agenda while still open has been carried. The count is a real
 * signal that an item is being avoided.
 */
export function carryOverCount(commitment: Commitment) {
  return Math.max(0, commitment.appearances.length - 1);
}

// ---------------------------------------------------------------------------
// Gaps — computed from domain records, never stored
// ---------------------------------------------------------------------------

function claimant(type: string, id: string): SeatKey | null {
  const claim = openCommitments().find(
    (item) => item.source?.type === type && item.source.id === id,
  );
  return claim?.seatId ?? null;
}

export function computeGaps(): Gap[] {
  const gaps: Gap[] = [];

  for (const lesson of lessons) {
    if (lesson.status === "needs_teacher" || lesson.status === "needs_topic") {
      gaps.push({
        id: `gap-lesson-${lesson.id}`,
        title: `${lesson.topic || "Lesson"} has no ${lesson.status === "needs_teacher" ? "teacher" : "topic"}`,
        area: "lessons",
        source: { type: "lesson", id: lesson.id },
        claimedBy: claimant("lesson", lesson.id),
        status: lesson.status,
      });
    }
  }

  for (const cleaning of cleaningAssignments) {
    const short = cleaning.familiesNeeded - cleaning.confirmedFamilies.length;
    if (short > 0) {
      gaps.push({
        id: `gap-cleaning-${cleaning.id}`,
        title: `Cleaning needs ${short} more ${short === 1 ? "family" : "families"}`,
        area: "cleaning",
        source: { type: "cleaning", id: cleaning.id },
        claimedBy: claimant("cleaning", cleaning.id),
        status: cleaning.status,
      });
    }
  }

  for (const service of serviceOpportunities) {
    if (service.status === "draft") {
      gaps.push({
        id: `gap-service-${service.id}`,
        title: `${service.title} has not been opened for signups`,
        area: "service",
        source: { type: "service", id: service.id },
        claimedBy: claimant("service", service.id),
        status: service.status,
      });
    }
  }

  if (sundayProgram.status !== "published") {
    gaps.push({
      id: `gap-program-${sundayProgram.programDate}`,
      title: "Sunday program is not published",
      area: "program",
      source: { type: "program", id: sundayProgram.programDate },
      claimedBy: claimant("program", sundayProgram.programDate),
      status: sundayProgram.status,
    });
  }

  for (const form of signupForms) {
    if (form.status !== "open") continue;
    const needed = form.slots.reduce((sum, slot) => sum + slot.quantityNeeded, 0);
    const filled = form.slots.reduce((sum, slot) => sum + slot.responses.length, 0);
    if (filled < needed) {
      gaps.push({
        id: `gap-signup-${form.id}`,
        title: `${form.title} needs ${needed - filled} more`,
        area: "signups",
        source: { type: "signup", id: form.id },
        claimedBy: claimant("signup", form.id),
        status: form.status,
      });
    }
  }

  return gaps;
}

/** Everything a seat currently owns: commitments plus any gaps it has claimed. */
export function getSeatWork(seatId: SeatKey) {
  const owned = commitmentsForSeat(seatId);
  return {
    commitments: owned,
    gaps: computeGaps().filter((gap) => gap.claimedBy === seatId),
    serviceOpportunities: serviceOpportunities.filter((item) => item.seatId === seatId),
    cleaningAssignments: cleaningAssignments.filter((item) => item.seatId === seatId),
  };
}
