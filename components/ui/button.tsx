import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
  Buttons are the ACTION register: near-black fill, pill corners, never the
  accent.

  Cobalt used to fill the default button, which meant the accent marked both
  "do this" and "you are here" at once. Splitting them gives each colour one
  job — black commits, cobalt navigates — and stops a page of buttons from
  competing with the nav for the eye.

  The pill matches the public bulletin, so the two surfaces read as one product.
  Horizontal padding is larger than a rounded rectangle needs, because a pill's
  curve eats optical space at both ends.
*/
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/88",
        secondary: "bg-secondary text-secondary-foreground hover:bg-border",
        outline:
          "border border-border-strong bg-background text-foreground hover:bg-surface-hover",
        ghost: "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-10 px-5 text-sm",
        // Square dimensions plus the shared rounded-full makes a circle.
        icon: "size-9 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
