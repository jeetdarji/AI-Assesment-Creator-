"use client";

import {
  ChevronLeft,
  LayoutGrid,
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const router = useRouter();

  return (
    <>
      {/* ─── Desktop TopBar ─── */}
      <header className="hidden lg:flex fixed top-3 left-[calc(var(--sidebar-width)+24px)] right-3 z-30 h-topbar items-center rounded-2xl glass px-6 pl-6 pr-3 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
        {/* Left: Back arrow + grid icon + "Assignment" */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-press flex h-10 w-10 items-center justify-center rounded-full bg-white/60 backdrop-blur-sm"
          >
            <ChevronLeft className="h-6 w-6 text-veda-text" />
          </button>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-veda-text-disabled" />
            <span className="font-bricolage text-base font-semibold tracking-[-0.04em] text-veda-text-disabled">
              Assignment
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Notification bell + avatar + name + chevron */}
        <div className="flex items-center gap-2">
          {/* Bell with red dot */}
          <button
            type="button"
            className="btn-press relative flex h-9 w-9 items-center justify-center rounded-full bg-veda-offwhite"
          >
            <Bell className="h-6 w-6 text-veda-text" />
            <span className="absolute right-1 top-0.5 h-2 w-2 rounded-full bg-veda-btn-orange" />
          </button>

          {/* User profile */}
          <div className="flex items-center gap-2 rounded-xl px-3 py-1.5 glass-light shadow-[0px_2px_8px_rgba(0,0,0,0.06)]">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-veda-offwhite">
              <span className="flex h-full w-full items-center justify-center font-bricolage text-sm font-bold text-veda-text">
                JD
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bricolage text-base font-semibold tracking-[-0.04em] text-veda-text">
                Jeet Darji
              </span>
              <ChevronDown className="h-6 w-6 text-veda-text" />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile TopBar ─── */}
      <header className="flex lg:hidden fixed top-2.5 left-2.5 right-2.5 z-30 items-center justify-center">
        <div className="flex w-full items-center justify-between rounded-2xl glass-strong px-3 py-2 pr-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          {/* Left: VedaAI logo */}
          <div className="flex items-center gap-2">
            <div
              className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-lg"
              style={{ background: "#303030" }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                V
              </span>
            </div>
            <span className="font-bricolage text-xl font-bold tracking-[-0.06em] text-veda-text">
              VedaAI
            </span>
          </div>

          {/* Right: Bell + avatar + hamburger */}
          <div className="flex items-center gap-3">
            {/* Bell with red dot */}
            <button
              type="button"
              className="btn-press relative flex h-9 w-9 items-center justify-center rounded-full bg-veda-offwhite"
            >
              <Bell className="h-6 w-6 text-veda-text" />
              <span className="absolute right-1 top-0.5 h-2 w-2 rounded-full bg-veda-btn-orange" />
            </button>

            {/* Avatar */}
            <div className="h-8 w-8 overflow-hidden rounded-full bg-veda-offwhite">
              <span className="flex h-full w-full items-center justify-center font-bricolage text-sm font-bold text-veda-text">
                JD
              </span>
            </div>

            {/* Hamburger menu */}
            <button type="button" className="btn-press flex items-center justify-center">
              <Menu className="h-6 w-6 text-veda-surface-on" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
