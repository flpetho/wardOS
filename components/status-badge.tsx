import { Badge } from "@/components/ui/badge";
import type { Status } from "@/lib/types";

export function StatusBadge({ status }: { status: Status | string }) {
  const variant =
    status === "Completed" || status === "Published" || status === "Filled"
      ? "success"
      : status === "Needs teacher" ||
          status === "Needs topic" ||
          status === "Needs families" ||
          status === "Partially filled" ||
          status === "Waiting"
        ? "warning"
        : status === "Draft"
          ? "outline"
          : "secondary";

  return <Badge variant={variant}>{status}</Badge>;
}
