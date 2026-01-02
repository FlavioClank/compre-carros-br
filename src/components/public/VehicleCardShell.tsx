import * as React from "react";

import { cn } from "@/lib/utils";

interface VehicleCardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * VehicleCardShell
 * Base visual container shared between vehicle cards and ad cards.
 * Keeps height, padding, border, shadow and responsive behavior consistent.
 */
export const VehicleCardShell = React.forwardRef<HTMLDivElement, VehicleCardShellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Uniform styling for all cards - no first-child differences
          "group bg-card rounded-xl overflow-hidden border border-border shadow-card card-hover",
          // Ensure consistent spacing and no margin collapse issues
          "first:mt-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

VehicleCardShell.displayName = "VehicleCardShell";
