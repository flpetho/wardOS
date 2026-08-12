import { Badge } from "@/components/ui/badge";

type Tone = "success" | "attention" | "warning" | "info" | "secondary";

/*
  The single mapping point between the database's snake_case vocabulary and
  what a human reads. Both used to exist independently — the schema said
  'on_agenda' while the app said "On agenda" — which is how they drifted.

  Colour is functional. Green means resolved, red means someone has to act,
  amber means underway, blue means scheduled, grey means dormant.
*/
const STATUSES: Record<string, { label: string; tone: Tone }> = {
  // Lessons
  needs_topic: { label: "Needs topic", tone: "attention" },
  needs_teacher: { label: "Needs teacher", tone: "attention" },
  assigned: { label: "Assigned", tone: "info" },
  prepared: { label: "Prepared", tone: "success" },

  // Cleaning
  needs_families: { label: "Needs families", tone: "attention" },
  partially_filled: { label: "Partially filled", tone: "warning" },
  filled: { label: "Filled", tone: "success" },

  // Service, signups, meetings
  draft: { label: "Draft", tone: "secondary" },
  open: { label: "Open", tone: "info" },
  closed: { label: "Closed", tone: "secondary" },
  completed: { label: "Completed", tone: "success" },
  archived: { label: "Archived", tone: "secondary" },

  // Sunday program
  ready_for_review: { label: "Ready for review", tone: "warning" },
  published: { label: "Published", tone: "success" },

  // Commitments
  proposed: { label: "Proposed", tone: "secondary" },
  on_agenda: { label: "On agenda", tone: "info" },
  committed: { label: "Committed", tone: "warning" },
  done: { label: "Done", tone: "success" },
  dropped: { label: "Dropped", tone: "secondary" },

  // Source sensitivity
  safe: { label: "Safe", tone: "success" },
  review: { label: "Review", tone: "warning" },
  sensitive: { label: "Sensitive", tone: "attention" },
  excluded: { label: "Excluded", tone: "attention" },
};

export function statusLabel(status: string) {
  return STATUSES[status]?.label ?? status;
}

export function StatusBadge({ status }: { status: string }) {
  const entry = STATUSES[status];
  return <Badge variant={entry?.tone ?? "secondary"}>{entry?.label ?? status}</Badge>;
}
