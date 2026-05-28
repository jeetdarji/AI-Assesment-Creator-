"use client";

import AppLayout from "@/components/layout/AppLayout";
import SchoolHeader from "@/components/output/SchoolHeader";
import StudentInfoSection from "@/components/output/StudentInfoSection";
import QuestionSection from "@/components/output/QuestionSection";
import AnswerKey from "@/components/output/AnswerKey";
import ActionBar from "@/components/output/ActionBar";
import { useOutputStore } from "@/store/outputStore";
import axiosInstance from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

const PdfDownloadButton = dynamic(
  () => import("@/components/pdf/PdfDownloadButton"),
  { ssr: false, loading: () => null }
);

/* ─── Skeleton Loader ─── */
function OutputSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Banner skeleton */}
      <div className="rounded-[24px] bg-[#303030]/80 p-6 lg:p-8">
        <div className="h-4 w-3/4 bg-white/10 rounded-full mb-3" />
        <div className="h-4 w-1/2 bg-white/10 rounded-full mb-4" />
        <div className="h-10 w-40 bg-white/10 rounded-full" />
      </div>

      {/* Content card skeleton */}
      <div className="rounded-[24px] bg-white p-6 lg:p-8 shadow-sm">
        {/* School header */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="h-6 w-72 bg-gray-200 rounded-full" />
          <div className="h-4 w-40 bg-gray-200 rounded-full" />
          <div className="h-4 w-32 bg-gray-200 rounded-full" />
          <div className="w-full h-px bg-gray-200 my-2" />
          <div className="flex w-full justify-between">
            <div className="h-4 w-40 bg-gray-200 rounded-full" />
            <div className="h-4 w-40 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Student info */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="h-4 w-60 bg-gray-200 rounded-full" />
          <div className="h-4 w-52 bg-gray-200 rounded-full" />
          <div className="h-4 w-44 bg-gray-200 rounded-full" />
        </div>

        {/* Questions */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-6">
            <div className="h-5 w-32 bg-gray-200 rounded-full mx-auto mb-3" />
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex gap-2 mb-2">
                <div className="h-4 w-6 bg-gray-200 rounded-full shrink-0" />
                <div className="h-4 w-16 bg-gray-200 rounded-full shrink-0" />
                <div className="h-4 flex-1 bg-gray-200 rounded-full" />
                <div className="h-4 w-16 bg-gray-200 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*                      OUTPUT PAGE                               */
/* ═══════════════════════════════════════════════════════════════ */
export default function OutputPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const { output, loading, error, setOutput, setLoading, setError, clearOutput } =
    useOutputStore();

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);

  // Measure pages effect
  useEffect(() => {
    const measurePages = () => {
      if (contentRef.current) {
        const scrollW = contentRef.current.scrollWidth;
        const clientW = contentRef.current.clientWidth;
        if (clientW > 0) {
          const pages = Math.round((scrollW + 40) / (clientW + 40));
          setTotalPages(Math.max(1, pages));
        }
      }
    };

    measurePages();
    const timeoutId = setTimeout(measurePages, 100);
    window.addEventListener("resize", measurePages);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", measurePages);
    };
  }, [output]);

  const handlePrev = () => setCurrentPage(p => Math.max(0, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));

  // Fetch output on mount
  useEffect(() => {
    if (!assignmentId) return;

    let cancelled = false;

    async function fetchOutput() {
      clearOutput();
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/assignments/${assignmentId}/output`
        );
        if (!cancelled) {
          setOutput(response.data.output);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load output. Please try again.";
          setError(message);
        }
      }
    }

    fetchOutput();
    return () => {
      cancelled = true;
    };
  }, [assignmentId, setOutput, setLoading, setError, clearOutput]);

  // ── Loading state ──
  if (loading) {
    return (
      <AppLayout>
        <div className="w-full max-w-[900px] mx-auto">
          <OutputSkeleton />
        </div>
      </AppLayout>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-var(--topbar-height)-96px)]">
          <div className="w-full max-w-md mx-auto rounded-[32px] glass p-8 flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-200">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="font-bricolage text-xl font-bold tracking-[-0.04em] text-[#303030]">
              Something went wrong
            </h2>
            <p className="font-bricolage text-sm font-normal tracking-[-0.04em] text-[rgba(94,94,94,0.8)]">
              {error}
            </p>
            <button
              type="button"
              onClick={() => router.push("/assignments")}
              className="btn-press flex items-center gap-2 rounded-full glass-dark px-6 py-3 font-bricolage text-base font-medium tracking-[-0.04em] text-white transition-all hover:bg-[rgba(24,24,24,0.8)] active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── No output ──
  if (!output) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-var(--topbar-height)-96px)]">
          <p className="font-bricolage text-base font-medium text-[rgba(94,94,94,0.55)]">
            No output available.
          </p>
        </div>
      </AppLayout>
    );
  }

  // ── Output exists — render ──
  return (
    <AppLayout>
      <div className="w-full max-w-[900px] mx-auto flex flex-col gap-6 pb-12 animate-fade-in-up">
        {/* ── TOP DARK BANNER ── */}
        <div className="rounded-[24px] bg-[#1a1a2e] p-6 lg:p-8 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => router.push("/assignments")}
            className="btn-press flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-bricolage text-sm font-medium tracking-[-0.04em] text-white backdrop-blur-sm hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Assignments</span>
          </button>
          <p className="font-bricolage text-sm lg:text-base font-normal tracking-[-0.04em] text-white/90 leading-relaxed">
            Certainly,{" "}
            <span className="font-semibold text-white">{output.schoolName}</span>!
            Here are customized Question Paper for your{" "}
            <span className="font-semibold text-white">{output.classGrade}</span>{" "}
            <span className="font-semibold text-white">{output.subject}</span>{" "}
            classes on the NCERT chapters:
          </p>

          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Download pill */}
            <PdfDownloadButton
              data={output}
              assignmentId={assignmentId}
              className="border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
            />

            {/* Action bar */}
            <ActionBar assignmentId={assignmentId} output={output} showDownload={false} />
          </div>
        </div>

        {/* ── PAGINATION CONTROLS ── */}
        <div className="flex items-center justify-between w-full rounded-[24px] bg-[#1a1a2e] p-4 lg:px-8 shadow-sm border border-white/20 animate-fade-in-up mt-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="btn-press px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bricolage text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {"< Previous Page"}
          </button>
          <span className="font-bricolage text-sm lg:text-base font-medium tracking-[-0.04em] text-white">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className="btn-press px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bricolage text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {"Next Page >"}
          </button>
        </div>

        {/* ── WHITE CONTENT CARD (A4 PAGINATED VIEWPORT) ── */}
        <div className="relative w-full max-w-[800px] mx-auto overflow-hidden bg-white shadow-sm border border-gray-100 rounded-[24px]">
          <div className="relative w-full" style={{ height: '1131px', padding: '48px' }}>
            <div style={{ height: '100%', overflow: 'hidden' }}>
              <div 
                ref={contentRef}
                style={{
                  height: '100%',
                  columnWidth: '704px',
                  columnGap: '40px',
                  columnFill: 'auto',
                  transform: `translateX(calc(-${currentPage} * (100% + 40px)))`,
                  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className="block space-y-4"
              >
          {/* School header */}
          <SchoolHeader
            schoolName={output.schoolName}
            subject={output.subject}
            classGrade={output.classGrade}
            timeAllowed={output.timeAllowed}
            maxMarks={output.maxMarks}
          />

          {/* Student info */}
          <StudentInfoSection classGrade={output.classGrade} />

          {/* Divider */}
          <div className="w-full h-[2px] bg-black my-2" />

          {/* Sections */}
          {output.sections.map((section, idx) => (
            <QuestionSection key={idx} section={section} />
          ))}

          {/* End of paper */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="font-bricolage text-sm font-bold tracking-[-0.04em] text-[#303030] whitespace-nowrap">
              End of Question Paper
            </span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#E5E7EB]" />

          {/* Answer key */}
          <AnswerKey answerKey={output.answerKey} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
