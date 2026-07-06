import type {
  Assignment,
  CleaningAssignment,
  Lesson,
  ServiceOpportunity,
  SignupForm,
  SundayProgram,
} from "@/lib/types";

export const workspace = {
  name: "Oak Hills Ward",
  slug: process.env.NEXT_PUBLIC_WARD_SLUG || "oak-hills",
};

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
    dueDate: "2026-07-10",
    relatedModule: "Lessons",
    status: "In progress",
  },
  {
    id: "assignment-2",
    title: "Review cleaning signup after Sunday",
    owner: "Secretary",
    dueDate: "2026-07-13",
    relatedModule: "Cleaning",
    status: "Not started",
  },
  {
    id: "assignment-3",
    title: "Publish Sunday program",
    owner: "EQ President",
    dueDate: "2026-07-11",
    relatedModule: "Sunday Program",
    status: "Waiting",
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
