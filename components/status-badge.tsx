import { Badge } from "@/components/ui/badge";
import type { Status } from "@/lib/types";

type Tone = "success" | "attention" | "warning" | "info" | "secondary";

/*
  Status colour is functional. Green means resolved, red means someone has to
  act, amber means underway, blue means scheduled, grey means dormant. Nothing
  is coloured to look lively.
*/
const tones: Record<string, Tone> = {
  // Resolved
  Completed: "success",
  Published: "success",
  Filled: "success",
  Prepared: "success",
  Decided: "success",
  safe: "success",

  // Needs someone to act
  "Needs topic": "attention",
  "Needs teacher": "attention",
  "Needs families": "attention",
  sensitive: "attention",
  excluded: "attention",

  // Underway
  "In progress": "warning",
  Waiting: "warning",
  "Partially filled": "warning",
  "Carried over": "warning",
  review: "warning",

  // Scheduled or awaiting review
  Assigned: "info",
  Open: "info",
  "On agenda": "info",
  "Ready for review": "info",

  // Dormant
  Draft: "secondary",
  Proposed: "secondary",
  "Not started": "secondary",
  Archived: "secondary",
};

export function StatusBadge({ status }: { status: Status | string }) {
  return <Badge variant={tones[status] ?? "secondary"}>{status}</Badge>;
}
