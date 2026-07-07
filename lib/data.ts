import type {
  Assignment,
  AgendaItem,
  CleaningAssignment,
  Decision,
  LeadershipRole,
  LeadershipRoleId,
  Lesson,
  Meeting,
  ServiceOpportunity,
  SignupForm,
  SundayProgram,
} from "@/lib/types";

export const workspace = {
  name: "Oak Hills Ward",
  slug: process.env.NEXT_PUBLIC_WARD_SLUG || "oak-hills",
};

export const leadershipRoles: LeadershipRole[] = [
  {
    id: "eqp",
    navLabel: "EQP",
    title: "Elders Quorum President",
    person: "Ethan Ward",
    calling: "EQP",
    summary: "Owns presidency direction, coordination with bishopric, and decisions that need quorum-wide alignment.",
    responsibilities: ["Presidency priorities", "Bishopric coordination", "Sunday readiness"],
  },
  {
    id: "eq1",
    navLabel: "EQ1",
    title: "First Counselor",
    person: "Ferenc Petho",
    calling: "EQ1",
    summary: "Owns Family History and Service Assignments, with agenda items and follow-up work grouped here.",
    responsibilities: ["Family History", "Service Assignments"],
  },
  {
    id: "eq2",
    navLabel: "EQ2",
    title: "Second Counselor",
    person: "Marcus Lee",
    calling: "EQ2",
    summary: "Owns lessons, activities support, and cleaning coordination until the presidency refines domains.",
    responsibilities: ["Lessons", "Activities", "Cleaning Assignments"],
  },
  {
    id: "eqs",
    navLabel: "EQS",
    title: "Elders Quorum Secretary",
    person: "Caleb Jensen",
    calling: "EQS",
    summary: "Owns meeting notes, agenda hygiene, action item tracking, and source links.",
    responsibilities: ["Meeting notes", "Action item tracking", "Sources"],
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
    owner: "First Counselor",
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
    title: "Draft family history invitation for quorum",
    owner: "First Counselor",
    ownerRole: "eq1",
    dueDate: "2026-07-20",
    relatedModule: "Leadership",
    responsibility: "Family History",
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
    title: "Family history Sunday invitation",
    detail: "Decide whether to invite a ward family history consultant into quorum for five minutes.",
    ownerRole: "eq1",
    responsibility: "Family History",
    status: "On agenda",
    meetingDate: "2026-07-14",
  },
  {
    id: "agenda-2",
    title: "Porter move coverage",
    detail: "Carry over until the signup has six confirmed volunteers.",
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
      "Lessons",
      "Family History",
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
