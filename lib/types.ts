export type Status =
  | "Needs topic"
  | "Needs teacher"
  | "Assigned"
  | "Prepared"
  | "Completed"
  | "Not started"
  | "In progress"
  | "Waiting"
  | "Draft"
  | "Open"
  | "Filled"
  | "Needs families"
  | "Partially filled"
  | "Published"
  | "Ready for review";

export type Lesson = {
  id: string;
  date: string;
  topic: string;
  sourceMaterial: string;
  teacher: string;
  backupTeacher: string;
  status: Status;
  notes: string;
};

export type Assignment = {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  relatedModule: string;
  status: Status;
};

export type ServiceOpportunity = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  owner: string;
  needed: string;
  status: Status;
  signupFormId: string;
};

export type CleaningAssignment = {
  id: string;
  cleaningDate: string;
  startTime: string;
  familiesNeeded: number;
  assignedFamilies: string[];
  confirmedFamilies: string[];
  status: Status;
  signupFormId: string;
};

export type SignupForm = {
  id: string;
  title: string;
  description: string;
  status: "Open" | "Closed";
  relatedType: "service" | "cleaning";
  slots: { id: string; title: string; quantityNeeded: number; responses: string[] }[];
};

export type SundayProgram = {
  programDate: string;
  status: "Draft" | "Ready for review" | "Published";
  presiding: string;
  conducting: string;
  openingHymn: string;
  openingPrayer: string;
  wardBusiness: string;
  sacramentHymn: string;
  speakers: string[];
  intermediateHymn: string;
  closingHymn: string;
  closingPrayer: string;
  announcements: string[];
  upcomingEvents: string[];
  lessonSchedule: string;
};
