import * as React from "react";

import { cn } from "@/lib/utils";

interface VehicleCardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * VehicleCardShell
 * Base visual container shared between vehicle cards and ad cards.
 * Keeps height, padding, border, shadow and responsive behavior consistent.
 */
export function VehicleCardShell({ className, children, ...props }: VehicleCardShellProps) {
  return (
    <div
      className={cn(
        "group bg-card rounded-xl overflow-hidden border border-border shadow-card card-hover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
