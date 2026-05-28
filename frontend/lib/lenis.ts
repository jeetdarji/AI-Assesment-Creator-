// filepath: frontend/lib/lenis.ts
// description: Lenis smooth-scroll singleton — initializes once and persists for the session.

import Lenis from "lenis";

let lenisInstance: Lenis | null = null;
let animationFrameId: number | null = null;

export function initLenis(): Lenis {
  if (lenisInstance) {
    return lenisInstance;
  }

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    smoothWheel: true,
  });

  function raf(time: number): void {
    if (!lenisInstance) {
      animationFrameId = null;
      return;
    }
    lenisInstance.raf(time);
    animationFrameId = requestAnimationFrame(raf);
  }
  animationFrameId = requestAnimationFrame(raf);

  return lenisInstance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function destroyLenis(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}
