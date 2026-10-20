"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type PageTransitionProps = {
  children: ReactNode;
};

/** CSS enter animation. Reduced motion is handled in globals.css. */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
