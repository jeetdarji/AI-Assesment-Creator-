"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  FileText,
  BookOpen,
  Clock,
  Settings,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  id: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Home", icon: LayoutGrid, id: "home" },
  { label: "My Groups", icon: Users, id: "groups" },
  { label: "Assignments", icon: FileText, id: "assignments" },
  { label: "AI Teacher's Toolkit", icon: BookOpen, id: "toolkit" },
  { label: "My Library", icon: Clock, id: "library" },
];

const mobileNavItems: NavItem[] = [
  { label: "Home", icon: LayoutGrid, id: "home" },
  { label: "Assignments", icon: FileText, id: "assignments" },
  { label: "Library", icon: Clock, id: "library" },
  { label: "AI Toolkit", icon: Sparkles, id: "toolkit" },
];

export default function Sidebar() {
  const [activeNav, setActiveNav] = useState<string>("assignments");
  const router = useRouter();

  const handleNav = (id: string) => {
    setActiveNav(id);
    if (id === "home") {
      router.push("/");
    }
    if (id === "assignments") {
      router.push("/assignments");
    }
  };

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex fixed left-3 top-3 bottom-3 z-40 w-sidebar flex-col justify-between rounded-2xl p-6 glass shadow-[0px_4px_24px_rgba(0,0,0,0.06)]">
        {/* Top Section */}
        <div className="flex flex-col items-center gap-14">
          {/* Logo */}
          <div className="flex w-full items-center gap-2">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-[10px]"
              style={{ background: "linear-gradient(180deg, #E56820 0%, #D45E3E 100%)" }}>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl drop-shadow-md">
                V
              </span>
            </div>
            <span className="font-bricolage text-[28px] font-bold leading-5 tracking-[-0.06em] text-veda-text">
              VedaAI
            </span>
          </div>

          {/* Create Assignment Button */}
          <button
            onClick={() => router.push("/assignments/create")}
            className="btn-press flex w-full items-center justify-center gap-2.5 rounded-full px-11 py-2 transition-all hover:opacity-90 bg-black backdrop-blur-md border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_4px_12px_rgba(0,0,0,0.6)]"
          >
            <Sparkles className="h-[18px] w-[18px] text-white" />
            <span className="whitespace-nowrap text-base font-medium tracking-[-0.04em] text-white">
              Create Assignment
            </span>
          </button>

          {/* Nav Menu */}
          <nav className="flex w-full flex-col gap-2">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`btn-press flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base tracking-[-0.04em] transition-colors ${
                    isActive
                      ? "bg-veda-offwhite-20 font-medium text-veda-text"
                      : "font-normal text-veda-text-secondary hover:bg-veda-offwhite-20/50"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge ? (
                    <span className="flex h-5 min-w-[24px] items-center justify-center rounded-full bg-veda-btn-orange px-1.5 text-[11px] font-semibold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-2">
          {/* Settings */}
          <button
            type="button"
            className="btn-press flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base font-normal tracking-[-0.04em] text-veda-text-secondary hover:bg-veda-offwhite-20/50 transition-colors"
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span>Settings</span>
          </button>

          {/* School Profile Card */}
          <div className="flex items-center gap-2 rounded-2xl glass-light p-3">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-veda-offwhite">
              <span className="flex h-full w-full items-center justify-center font-bricolage text-lg font-bold text-veda-text">
                V
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-[-0.04em] text-veda-text">
                Delhi Public School
              </span>
              <span className="text-sm font-normal tracking-[-0.04em] text-veda-dark">
                Bokaro Steel City
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Bottom Navigation ─── */}
      <div className="fixed bottom-2.5 left-2.5 right-2.5 z-50 lg:hidden">
        {/* FAB button */}
        <div className="flex justify-end px-2.5 pb-3">
          <button
            onClick={() => router.push("/assignments/create")}
            className="btn-press flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(20,20,20,0.85)] backdrop-blur-xl border border-white/10 shadow-veda-realistic"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="#FF5623" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Bottom Nav Bar */}
        <nav className="flex items-center justify-between rounded-3xl bg-[rgba(10,10,10,0.88)] backdrop-blur-xl border border-white/10 px-6 py-2 shadow-veda-realistic">
          {mobileNavItems.map((item) => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="btn-press flex flex-col items-center justify-center gap-1 rounded-3xl px-3 py-3"
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-white" : "text-white/25"
                  }`}
                />
                <span
                  className={`text-xs font-semibold tracking-[-0.04em] ${
                    isActive ? "text-white" : "text-white/25"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
