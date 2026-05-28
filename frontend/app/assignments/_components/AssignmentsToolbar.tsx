"use client";

import { SlidersHorizontal, Search, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
}

const statusFilters = ["all", "pending", "processing", "completed", "failed"];

export default function AssignmentsToolbar({
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-2xl glass px-4 h-16 relative z-[60]">
      {/* Filter Custom Dropdown */}
      <div className="relative shrink-0" ref={filterRef}>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 font-bricolage text-sm font-bold tracking-[-0.04em] text-veda-text border ${
            isFilterOpen ? "bg-white/50 border-white/60 shadow-sm" : "bg-transparent border-transparent hover:bg-white/20 hover:border-white/40"
          }`}
        >
          <SlidersHorizontal className={`h-4 w-4 transition-colors ${isFilterOpen ? "text-veda-text" : "text-veda-text-disabled"}`} />
          <span className="hidden sm:inline">
            {statusFilter === "all" ? "Filter By (All)" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </span>
          <ChevronDown className={`h-4 w-4 text-veda-text-disabled transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
        </button>

        <div
          className={`absolute left-0 top-full mt-2 w-48 rounded-xl bg-white border border-gray-200 p-1.5 shadow-xl shadow-black/10 origin-top transition-all duration-300 z-50 ${
            isFilterOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => {
                onStatusFilter(s);
                setIsFilterOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-left font-bricolage text-sm font-medium hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              <span className={statusFilter === s ? "text-veda-text font-bold" : "text-veda-text-secondary"}>
                {s === "all" ? "All Assignments" : s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {statusFilter === s && <Check className="h-4 w-4 text-black" />}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="flex h-11 flex-1 lg:flex-none lg:w-[380px] items-center gap-2 rounded-full border border-white/60 bg-white/40 backdrop-blur-md px-2 shadow-sm"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search Assignment"
          className="flex-1 bg-transparent px-3 font-bricolage text-sm font-bold tracking-[-0.04em] text-veda-text placeholder:text-veda-text-disabled focus:outline-none"
        />
        <button type="submit" className="p-2 bg-black rounded-full hover:opacity-80 transition-opacity">
          <Search className="h-4 w-4 text-white" />
        </button>
      </form>
    </div>
  );
}
