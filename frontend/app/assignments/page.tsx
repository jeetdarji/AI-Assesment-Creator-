"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Plus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import AssignmentCard, { Assignment } from "./_components/AssignmentCard";
import AssignmentsToolbar from "./_components/AssignmentsToolbar";
import axiosInstance from "@/lib/axios";

interface BackendAssignment {
  _id: string;
  assignmentName?: string;
  fileName?: string;
  totalQuestions: number;
  createdAt: string;
  dueDate?: string;
  status: Assignment["status"];
}

function mapAssignment(a: BackendAssignment): Assignment {
  return {
    id: a._id,
    title: a.assignmentName || a.fileName || `Assignment ${a.totalQuestions} Questions`,
    assignedOn: new Date(a.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-"),
    dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString("en-GB").replace(/\//g, "-") : "No due date",
    status: a.status,
  };
}

export default function AssignmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const response = await axiosInstance.get("/api/assignments");
        const mapped = (response.data.assignments as BackendAssignment[]).map(mapAssignment);
        setAssignments(mapped);
      } catch (error) {
        console.error("Error fetching assignments", error);
      }
    }
    fetchAssignments();
  }, []);

  const filtered = useMemo(
    () =>
      assignments.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) &&
        (statusFilter === "all" || a.status === statusFilter)
      ),
    [search, statusFilter, assignments]
  );

  return (
    <AppLayout>
      <div className="relative w-full max-w-[1400px] mx-auto flex flex-col gap-5 pb-10 lg:px-2">
        {/* Header — Mobile: back button left, title centered */}
        <div className="flex items-center gap-3 lg:hidden relative">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="btn-press flex h-12 w-12 items-center justify-center rounded-full glass-subtle shrink-0"
          >
            <ArrowLeft className="h-6 w-6 text-veda-text" strokeWidth={2.5} />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 font-bricolage text-base font-bold tracking-[-0.04em] text-veda-text">
            Assignments
          </h1>
        </div>

        {/* Header — Desktop: green dot + title + subtitle */}
        <div className="hidden lg:flex items-center gap-3 px-2 pt-1">
          {/* Status dot — pulsing glow */}
          <span className="inline-flex relative shrink-0 h-3 w-3">
            <span className="absolute inset-0 rounded-full bg-[#4BC26D] opacity-60 animate-ping" />
            <span
              className="relative inline-block h-3 w-3 rounded-full bg-[#4BC26D]"
              style={{
                border: "4px solid rgba(75, 194, 109, 0.4)",
                boxShadow:
                  "0 0 0 4px rgba(75,194,109,0.25), 0 0 12px 2px rgba(75,194,109,0.6)",
              }}
            />
          </span>
          <div className="flex flex-col">
            <h1 className="font-bricolage text-xl font-bold tracking-[-0.04em] text-veda-text">
              Assignments
            </h1>
            <p className="font-bricolage text-sm font-normal tracking-[-0.04em]" style={{ color: "rgba(94,94,94,0.55)" }}>
              Manage and create assignments for your classes.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <AssignmentsToolbar
          search={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
        />

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          {filtered.map((a) => (
            <div 
              key={a.id} 
              onMouseEnter={() => {
                const url = a.status === "completed" ? `/assignments/${a.id}/output` : `/assignments/${a.id}`;
                router.prefetch(url);
              }}
            >
              <AssignmentCard 
                assignment={a} 
                onView={(assignment) => {
                  const url = assignment.status === "completed"
                      ? `/assignments/${assignment.id}/output`
                      : `/assignments/${assignment.id}`;
                  router.push(url);
                }}
                onDelete={async (id) => {
                  try {
                    // Optimistic update
                    setAssignments(prev => prev.filter(x => x.id !== id));
                    await axiosInstance.delete(`/api/assignments/${id}`);
                  } catch (e) {
                    console.error(e);
                    // Re-fetch on error to revert
                    const response = await axiosInstance.get("/api/assignments");
                    const mapped = (response.data.assignments as BackendAssignment[]).map(mapAssignment);
                    setAssignments(mapped);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Create Assignment - desktop with progressive backdrop blur */}
      <div className="hidden lg:block pointer-events-none fixed bottom-0 left-[calc(var(--sidebar-width)+24px)] right-0 z-30 h-[88px]">
        {/* Progressive blur layers (each clipped from a different point) */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 45%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 45%, black 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            maskImage: "linear-gradient(to bottom, transparent 55%, black 80%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 55%, black 80%, black 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            maskImage: "linear-gradient(to bottom, transparent 75%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 75%, black 100%)",
          }}
        />
        {/* Tint */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(218,218,218,0) 0%, rgba(218,218,218,0.4) 75%, #DADADA 100%)",
          }}
        />
        {/* Button */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center">
          <button
            type="button"
            onClick={() => router.push("/assignments/create")}
            className="btn-press pointer-events-auto flex items-center gap-1 rounded-full px-6 py-3 text-white transition-all hover:opacity-90 bg-black backdrop-blur-md border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_8px_24px_rgba(0,0,0,0.6)]"
          >
            <Plus className="h-5 w-5" />
            <span className="font-bricolage text-base font-medium tracking-[-0.04em]">
              Create Assignment
            </span>
          </button>
        </div>
      </div>

    </AppLayout>
  );
}
