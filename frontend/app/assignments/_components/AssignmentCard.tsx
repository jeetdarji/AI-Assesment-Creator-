"use client";

import { MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface Assignment {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  status?: string;
}

interface Props {
  assignment: Assignment;
  onView?: (assignment: Assignment) => void;
  onDelete?: (id: string) => void;
}

export default function AssignmentCard({ assignment, onView, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <div className="flex flex-col justify-center gap-6 lg:gap-12 rounded-3xl glass p-5 lg:p-6 w-full transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-bricolage text-[18px] lg:text-[22px] font-semibold tracking-[-0.04em] text-veda-text">
            {assignment.title}
          </h3>
          <button
            type="button"
            aria-label="More options"
            onClick={() => setOpen((s) => !s)}
            className="btn-press shrink-0 p-1 -m-1 text-veda-text lg:text-veda-text-disabled hover:text-veda-text"
          >
            <MoreVertical className="h-6 w-6" />
          </button>
        </div>

        {/* Dates row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="font-bricolage text-sm lg:text-base tracking-[-0.04em]">
            <span className="font-bold text-veda-text">Assigned on</span>
            <span className="font-normal text-veda-text-disabled"> : {assignment.assignedOn}</span>
          </p>
          <p className="font-bricolage text-sm lg:text-base tracking-[-0.04em]">
            <span className="font-bold text-veda-text">Due</span>
            <span className="font-normal text-veda-text-disabled"> : {assignment.dueDate}</span>
          </p>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-4 top-14 z-20 flex w-[140px] flex-col gap-1 rounded-2xl glass-strong p-2"
          style={{ boxShadow: "0px 16px 48px rgba(0,0,0,0.2), 0px 32px 48px rgba(0,0,0,0.05)" }}
        >
          <button
            onClick={() => {
              setOpen(false);
              onView?.(assignment);
            }}
            onMouseEnter={() => {
              // Preheat by doing a silent prefetch
            }}
            className="btn-press flex h-8 items-center rounded-lg px-2 text-left font-bricolage text-sm font-medium tracking-[-0.04em] text-veda-text hover:bg-veda-offwhite transition-colors"
          >
            View Assignment
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete?.(assignment.id);
            }}
            className="btn-press flex h-8 items-center rounded-lg hover:bg-veda-offwhite px-2 text-left font-bricolage text-sm font-medium tracking-[-0.04em] text-[#C53535] transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
