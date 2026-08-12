import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "warning"
  | "success"
  | "attention"
  | "info";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary-soft text-primary",
  info: "bg-info-soft text-info",
  success: "bg-ok-soft text-ok",
  warning: "bg-progress-soft text-progress",
  attention: "bg-attention-soft text-attention",
  secondary: "bg-neutral-soft text-neutral",
  outline: "border border-border text-muted-foreground",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
