// filepath: frontend/app/_components/LenisProvider.tsx
// description: Client component that initializes Lenis smooth scrolling on mount.

"use client";

import { useEffect, ReactNode } from "react";
import { initLenis, destroyLenis } from "@/lib/lenis";

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps): JSX.Element {
  useEffect(() => {
    initLenis();
    return () => {
      destroyLenis();
    };
  }, []);

  return <>{children}</>;
}
