"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useGenerationStore } from "@/store/generationStore";
import { useGenerationStatus } from "@/hooks/useGenerationStatus";
import axiosInstance from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function GenerationLoadingPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const { status, error, setStatus, setAssignmentId } = useGenerationStore();
  const [isRetrying, setIsRetrying] = useState(false);

  // Set up WebSocket listeners
  useGenerationStatus(assignmentId);

  const [elapsed, setElapsed] = useState(0);
  const steps = [
    "Reading your requirements",
    "Building the question structure",
    "Generating questions with AI",
    "Formatting your paper",
  ];

  // Timer and step progression
  useEffect(() => {
    if (status === "completed" || status === "failed") return;

    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const activeStep = useMemo(() => {
    if (status === "completed") {
      return 4;
    }
    if (status === "failed") {
      return 0;
    }

    if (elapsed >= 22) return 3;
    if (elapsed >= 12) return 2;
    if (elapsed >= 5) return 1;
    return 0;
  }, [elapsed, status]);

  // Set assignmentId on mount
  useEffect(() => {
    if (assignmentId) {
      setAssignmentId(assignmentId);
    }
  }, [assignmentId, setAssignmentId]);

  useEffect(() => {
    if (!assignmentId) return;

    let cancelled = false;

    async function fetchAssignmentStatus() {
      try {
        const response = await axiosInstance.get(`/api/assignments/${assignmentId}`);
        const nextStatus = response.data?.assignment?.status;
        if (!cancelled && nextStatus) {
          setStatus(nextStatus);
        }
      } catch {
        if (!cancelled) {
          setStatus("failed");
        }
      }
    }

    fetchAssignmentStatus();
    return () => {
      cancelled = true;
    };
  }, [assignmentId, setStatus]);

  // Auto-navigate on completed
  useEffect(() => {
    if (status === "completed") {
      router.push(`/assignments/${assignmentId}/output`);
    }
  }, [status, assignmentId, router]);

  // Fallback polling: if WebSocket event not received within 60s, poll every 5s
  useEffect(() => {
    if (status === "completed" || status === "failed") return;

    const pollingId = setInterval(async () => {
      try {
        const response = await axiosInstance.get(`/api/assignments/${assignmentId}`);
        const nextStatus = response.data?.assignment?.status;
        if (nextStatus) {
          setStatus(nextStatus);
        }
      } catch (err: unknown) {
        if (err && typeof err === "object" && "response" in err) {
          const axiosErr = err as { response?: { status?: number } };
          if (axiosErr.response?.status === 404 || axiosErr.response?.status === 500) {
            setStatus("failed");
          }
        }
      }
    }, 5000);

    return () => {
      clearInterval(pollingId);
    };
  }, [assignmentId, status, router, setStatus]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await axiosInstance.post(`/api/assignments/${assignmentId}/retry`);
      setStatus("pending");
    } catch {
      // Keep in failed state
    } finally {
      setIsRetrying(false);
    }
  }, [assignmentId, setStatus]);

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-var(--topbar-height)-96px)]">
        <div className="w-full max-w-md mx-auto rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 flex flex-col items-center text-center relative overflow-hidden animate-scale-in">
          
          {/* Top Circular Ring */}
          <div className="relative mb-6 flex items-center justify-center h-20 w-20">
            {status === "failed" ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border-2 border-red-500">
                <span className="text-2xl text-red-500">✕</span>
              </div>
            ) : status === "completed" ? (
              <div className="absolute inset-0 rounded-full border-[4px] border-[#10b981] bg-[#10b981] flex items-center justify-center transition-colors duration-500">
                <svg className="w-8 h-8 text-white" style={{ animation: "pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 rounded-full border-[4px] border-[#F6F6F6]" />
                <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-[#1a1a2e]" style={{ animation: "spin-ring 1.2s linear infinite" }} />
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center text-[#1a1a2e] opacity-50">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" fill="currentColor"/>
                   </svg>
                </div>
              </>
            )}
          </div>

          {/* Headings */}
          <h1 className="font-bricolage text-xl font-bold tracking-[-0.04em] text-[#303030] mb-2 transition-colors">
            {status === "failed"
              ? "Generation Failed"
              : status === "completed"
              ? "Your question paper is ready!"
              : "Generating your question paper..."}
          </h1>
          <p className="font-bricolage text-sm font-normal text-[rgba(94,94,94,0.8)] mb-6 min-h-[40px]">
            {status === "failed"
              ? "We couldn't generate the paper. Please try again."
              : status === "completed"
              ? "Redirecting you now..."
              : "Our AI is crafting a customized paper just for you."}
          </p>

          {/* Content Area */}
          {status === "failed" ? (
            <div className="flex flex-col items-center gap-4 w-full">
              {error && (
                <div className="w-full rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                  <p className="font-bricolage text-sm font-medium text-red-600 line-clamp-3">
                    {error}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="btn-press flex items-center gap-2 rounded-full bg-[#1a1a2e] px-6 py-3 font-bricolage text-base font-medium tracking-[-0.04em] text-white transition-all hover:bg-[rgba(26,26,46,0.9)] active:scale-95 disabled:opacity-60 mt-4"
              >
                {isRetrying ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
                <span>Try Again</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* Timer */}
              <div className="bg-[#f8f9fa] rounded-full px-4 py-1.5 mb-2 font-mono text-sm tracking-tight text-[#1a1a2e] font-semibold border border-gray-100">
                Elapsed: {elapsed}s
              </div>
              <div className="text-xs text-gray-400 mb-8 font-bricolage">Usually takes 45 - 60 secs</div>

              {/* Steps */}
              <div className="w-full flex flex-col gap-4 text-left px-4">
                {steps.map((step, index) => {
                  const isActive = index === activeStep && status !== "completed";
                  const isCompleted = index < activeStep || status === "completed";
                  
                  return (
                    <div key={index} className="flex items-center gap-3 transition-opacity duration-300" style={{ animation: "fade-in 0.3s ease-out forwards", animationDelay: `${index * 0.1}s`, opacity: 0 }}>
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center transition-all duration-300">
                            <span className="text-white text-[10px] font-bold leading-none">✓</span>
                          </div>
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full border-[2px] border-gray-200 border-t-[#1a1a2e] animate-spin transition-all duration-300" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 transition-all duration-300" />
                        )}
                      </div>
                      <span className={`font-bricolage text-sm font-medium transition-colors duration-300 ${
                        isCompleted ? "text-[#10b981]" : isActive ? "text-[#1a1a2e]" : "text-gray-400"
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pulsing Dots */}
              {status !== "completed" && (
                <div className="mt-10 flex gap-1.5 h-6 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block h-2 w-2 rounded-full bg-[#1a1a2e]"
                      style={{
                        animation: "pulse-dot 1.4s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {status === "failed" && (
            <button
              type="button"
              onClick={() => router.push("/assignments")}
              className="btn-press flex items-center gap-2 rounded-full glass-light px-5 py-2.5 mt-8 font-bricolage text-sm font-medium tracking-[-0.04em] text-[#303030] hover:bg-white/60"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Assignments</span>
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
