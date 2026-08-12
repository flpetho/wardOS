import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
  Dates are stored as bare `YYYY-MM-DD`. Pinning both the parse and the format
  to UTC keeps server and client output identical — formatting a bare date in
  the ambient timezone renders a different day either side of the hydration
  boundary for anyone west of Greenwich.
*/
export function formatDate(iso: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    ...options,
  }).format(new Date(`${iso}T00:00:00Z`));
}
