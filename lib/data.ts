import type {
  Assignment,
  AgendaItem,
  BudgetSummary,
  CleaningAssignment,
  Decision,
  LeadershipRole,
  LeadershipRoleId,
  Lesson,
  Meeting,
  ServiceOpportunity,
  SignupForm,
  SundayProgram,
  WardOrganization,
} from "@/lib/types";

export const workspace = {
  name: "Oak Hills Ward",
  slug: process.env.NEXT_PUBLIC_WARD_SLUG || "oak-hills",
};

export const leadershipRoles: LeadershipRole[] = [
  {
    id: "eqp",
    navLabel: "President",
    title: "President",
    person: "Nathan Placeholder",
    calling: "President",
    summary: "Coordinates quorum direction, bishopric alignment, ministering oversight, and presidency decisions.",
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
  },
  {
    id: "eq1",
    navLabel: "First Counselor",
    title: "First Counselor",
    person: "Ferenc Petho",
    calling: "First Counselor",
    summary: "Owns Family History and Service Assignments, with agenda items and follow-up work grouped here.",
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
  },
  {
    id: "eq2",
    navLabel: "Second Counselor",
    title: "Second Counselor",
    person: "Marcus Placeholder",
    calling: "Second Counselor",
    summary: "Owns lessons, activities support, and cleaning coordination until the presidency refines domains.",
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
  },
  {
    id: "eqs",
    navLabel: "Secretary",
    title: "Secretary",
    person: "Caleb Placeholder",
    calling: "Secretary",
    summary: "Owns meeting notes, agenda hygiene, action item tracking, and source links.",
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
  },
];

export const lessons: Lesson[] = [
  {
    id: "lesson-1",
    date: "2026-07-12",
    topic: "Becoming One in Christ",
    sourceMaterial: "General Conference address",
    teacher: "Daniel Kim",
    backupTeacher: "Marcus Lee",
    status: "Prepared",
    notes: "Use discussion format and leave five minutes for quorum invitations.",
  },
  {
    id: "lesson-2",
    date: "2026-07-26",
    topic: "Ministering Through Small Acts",
    sourceMaterial: "Come, Follow Me + conference excerpt",
    teacher: "Needs teacher",
    backupTeacher: "TBD",
    status: "Needs teacher",
    notes: "Confirm teacher before presidency meeting.",
  },
  {
    id: "lesson-3",
    date: "2026-08-09",
    topic: "Covenant Confidence",
    sourceMaterial: "Elder quorum presidency selection",
    teacher: "Jose Ramirez",
    backupTeacher: "TBD",
    status: "Assigned",
    notes: "Add source link when final talk is selected.",
  },
];

export const assignments: Assignment[] = [
  {
    id: "assignment-1",
    title: "Confirm July 26 teacher",
    owner: "Second Counselor",
    ownerRole: "eq2",
    dueDate: "2026-07-10",
    relatedModule: "Lessons",
    responsibility: "Lessons",
    status: "In progress",
  },
  {
    id: "assignment-2",
    title: "Review cleaning signup after Sunday",
    owner: "Secretary",
    ownerRole: "eqs",
    dueDate: "2026-07-13",
    relatedModule: "Cleaning",
    responsibility: "Action item tracking",
    status: "Not started",
  },
  {
    id: "assignment-3",
    title: "Publish Sunday program",
    owner: "EQ President",
    ownerRole: "eqp",
    dueDate: "2026-07-11",
    relatedModule: "Sunday Program",
    responsibility: "Sunday readiness",
    status: "Waiting",
  },
  {
    id: "assignment-4",
    title: "Draft temple and family history invitation for quorum",
    owner: "First Counselor",
    ownerRole: "eq1",
    dueDate: "2026-07-20",
    relatedModule: "Leadership",
    responsibility: "Temple and Family History",
    status: "Not started",
  },
  {
    id: "assignment-5",
    title: "Find two more volunteers for Porter move",
    owner: "First Counselor",
    ownerRole: "eq1",
    dueDate: "2026-07-16",
    relatedModule: "Service",
    responsibility: "Service Assignments",
    status: "In progress",
  },
];

export const serviceOpportunities: ServiceOpportunity[] = [
  {
    id: "service-1",
    title: "Move assistance for the Porters",
    description: "Load boxes and furniture into a rented truck.",
    date: "2026-07-18",
    location: "Porter home",
    owner: "Second Counselor",
    ownerRole: "eq1",
    responsibility: "Service Assignments",
    needed: "6 volunteers",
    status: "Open",
    signupFormId: "move-assistance",
  },
  {
    id: "service-2",
    title: "Youth activity setup",
    description: "Set up tables, chairs, and outdoor shade before the activity.",
    date: "2026-07-22",
    location: "Meetinghouse cultural hall",
    owner: "EQ Secretary",
    ownerRole: "eq1",
    responsibility: "Service Assignments",
    needed: "4 volunteers",
    status: "Draft",
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
    status: "Partially filled",
    signupFormId: "july-11-cleaning",
    ownerRole: "eq2",
    responsibility: "Cleaning Assignments",
  },
  {
    id: "cleaning-2",
    cleaningDate: "2026-07-25",
    startTime: "8:00 AM",
    familiesNeeded: 4,
    assignedFamilies: [],
    confirmedFamilies: [],
    status: "Needs families",
    signupFormId: "july-25-cleaning",
    ownerRole: "eq2",
    responsibility: "Cleaning Assignments",
  },
];

export const agendaItems: AgendaItem[] = [
  {
    id: "agenda-1",
    title: "Temple and family history Sunday invitation",
    detail: "Decide whether to invite a ward family history consultant into quorum for five minutes.",
    ownerRole: "eq1",
    responsibility: "Temple and Family History",
    status: "On agenda",
    meetingDate: "2026-07-14",
  },
  {
    id: "agenda-2",
    title: "Porter move coverage",
    detail: "Carry over until the signup has six confirmed volunteers. Keep notes limited to logistics.",
    ownerRole: "eq1",
    responsibility: "Service Assignments",
    status: "Carried over",
    meetingDate: "2026-07-14",
  },
  {
    id: "agenda-3",
    title: "July 26 teacher still needed",
    detail: "Confirm assignment and backup before Sunday.",
    ownerRole: "eq2",
    responsibility: "Lessons",
    status: "On agenda",
    meetingDate: "2026-07-14",
  },
  {
    id: "agenda-4",
    title: "Sensitive source treatment",
    detail: "Agree whether Visit List and Ministering Assignments stay link-only.",
    ownerRole: "eqp",
    responsibility: "Presidency priorities",
    status: "Proposed",
    meetingDate: "2026-07-28",
  },
  {
    id: "agenda-5",
    title: "Meeting notes format",
    detail: "Standardize decisions, action items, and carry-over notes.",
    ownerRole: "eqs",
    responsibility: "Meeting notes",
    status: "Carried over",
    meetingDate: "2026-07-14",
  },
  {
    id: "agenda-6",
    title: "Ministering interview cadence",
    detail: "Review quarterly interview coverage without storing private ministering details.",
    ownerRole: "eqp",
    responsibility: "Ministering oversight",
    status: "On agenda",
    meetingDate: "2026-07-14",
  },
  {
    id: "agenda-7",
    title: "Five-minute quorum counsel topic",
    detail: "Choose the Sunday counseling topic around a relevant ward need or opportunity.",
    ownerRole: "eq2",
    responsibility: "Gospel instruction",
    status: "Proposed",
    meetingDate: "2026-07-28",
  },
];

export const decisions: Decision[] = [
  {
    id: "decision-1",
    title: "Keep sensitive tabs link-only",
    detail: "No row-level data from Visit List or Ministering Assignments in v0.",
    meetingDate: "2026-06-30",
  },
];

export const meetings: Meeting[] = [
  {
    id: "meeting-1",
    title: "EQ Presidency Meeting",
    meetingDate: "2026-07-14",
    cadence: "Bi-monthly",
    status: "Open",
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
    carriedOverItemIds: ["agenda-2", "agenda-5"],
    decisionIds: ["decision-1"],
  },
];

export const budgetSummary: BudgetSummary = {
  year: 2026,
  totalAllocated: 2400,
  categories: [
    {
      id: "budget-activities",
      name: "Activities",
      allocated: 900,
      spent: 420,
      pending: 120,
    },
    {
      id: "budget-service",
      name: "Service",
      allocated: 650,
      spent: 185,
      pending: 75,
    },
    {
      id: "budget-lessons",
      name: "Lessons and supplies",
      allocated: 350,
      spent: 90,
      pending: 0,
    },
    {
      id: "budget-admin",
      name: "Admin and printing",
      allocated: 500,
      spent: 210,
      pending: 45,
    },
  ],
};

export const wardOrganizations: WardOrganization[] = [
  {
    id: "elders-quorum",
    name: "Elders Quorum",
    shortName: "EQ",
    status: "Active",
    leaderPlaceholder: "Nathan Placeholder",
    description: "Current operating workspace for presidency work, meetings, assignments, service, and Sunday readiness.",
  },
  {
    id: "relief-society",
    name: "Relief Society",
    shortName: "RS",
    status: "Planned",
    leaderPlaceholder: "Relief Society President",
    description: "Future operating view for Relief Society presidency coordination and shared ward work.",
  },
  {
    id: "young-men",
    name: "Young Men",
    shortName: "YM",
    status: "Planned",
    leaderPlaceholder: "Young Men President",
    description: "Future youth leadership coordination and activities view.",
  },
  {
    id: "young-women",
    name: "Young Women",
    shortName: "YW",
    status: "Planned",
    leaderPlaceholder: "Young Women President",
    description: "Future youth leadership coordination and activities view.",
  },
  {
    id: "primary",
    name: "Primary",
    shortName: "Primary",
    status: "Planned",
    leaderPlaceholder: "Primary President",
    description: "Future Primary presidency planning and operational coordination.",
  },
  {
    id: "bishopric",
    name: "Bishopric Master View",
    shortName: "Bishopric",
    status: "Later",
    leaderPlaceholder: "Bishopric",
    description: "Future master view across organizations, with strict boundaries around confidential bishopric matters.",
  },
];

export const signupForms: SignupForm[] = [
  {
    id: "move-assistance",
    title: "Move assistance for the Porters",
    description: "Sign up for a time slot. Public form collects name only.",
    status: "Open",
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
    status: "Open",
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
  status: "Published",
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

export const sources = [
  {
    title: "Lesson Schedule for the Year",
    type: "Google Sheet tab",
    sensitivity: "safe",
    treatment: "Imported into Lessons",
  },
  {
    title: "Service Assignments",
    type: "Google Sheet tab",
    sensitivity: "safe",
    treatment: "Imported into Service",
  },
  {
    title: "Cleaning Assignments",
    type: "Google Sheet tab",
    sensitivity: "safe",
    treatment: "Imported into Cleaning",
  },
  {
    title: "Visit List",
    type: "Google Sheet tab",
    sensitivity: "sensitive",
    treatment: "Link only",
  },
  {
    title: "Ministering Assignments",
    type: "Google Sheet tab",
    sensitivity: "sensitive",
    treatment: "Link only",
  },
];

export function getSignupForm(formId: string) {
  return signupForms.find((form) => form.id === formId);
}

export function getLeadershipRole(roleId: string) {
  return leadershipRoles.find((role) => role.id === roleId);
}

export function getLeadershipWork(roleId: LeadershipRoleId) {
  return {
    assignments: assignments.filter((item) => item.ownerRole === roleId),
    agendaItems: agendaItems.filter((item) => item.ownerRole === roleId),
    serviceOpportunities: serviceOpportunities.filter((item) => item.ownerRole === roleId),
    cleaningAssignments: cleaningAssignments.filter((item) => item.ownerRole === roleId),
  };
}
