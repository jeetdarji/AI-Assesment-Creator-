"use client";

import AppLayout from "@/components/layout/AppLayout";
import StepIndicator from "@/components/create/StepIndicator";
import FileUpload from "@/components/create/FileUpload";
import DueDatePicker from "@/components/create/DueDatePicker";
import QuestionTypeRow from "@/components/create/QuestionTypeRow";
import AdditionalInfoTextarea from "@/components/create/AdditionalInfoTextarea";
import { useAssignmentFormStore, QuestionTypeEntry } from "@/store/assignmentFormStore";
import { useGenerationStore } from "@/store/generationStore";
import axiosInstance from "@/lib/axios";
import { ArrowLeft, ArrowRight, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

/* ─── Validation types ─── */
interface RowErrors {
  type?: string;
  count?: string;
  marks?: string;
}

interface FormErrors {
  assignmentName?: string;
  questionTypes?: string;
  rows: Record<string, RowErrors>;
  dueDate?: string;
  file?: string;
}

function validateForm(
  assignmentName: string,
  questionTypes: QuestionTypeEntry[],
  dueDate: string,
  file: File | null
): FormErrors {
  const errors: FormErrors = { rows: {} };

  if (!assignmentName || assignmentName.trim() === "") {
    errors.assignmentName = "Assignment Name is required";
  }

  // 1. At least 1 question type
  if (questionTypes.length === 0) {
    errors.questionTypes = "Please add at least one question type";
  }

  // 2. Per-row validation
  const seenTypes = new Set<string>();
  questionTypes.forEach((qt) => {
    const rowErr: RowErrors = {};

    if (!qt.type || qt.type.trim() === "") {
      rowErr.type = "Please select a question type";
    } else if (seenTypes.has(qt.type)) {
      rowErr.type = "Duplicate question type";
    } else {
      seenTypes.add(qt.type);
    }

    if (!Number.isInteger(qt.count) || qt.count < 1) {
      rowErr.count = "Must be at least 1";
    }
    if (!Number.isInteger(qt.marks) || qt.marks < 1) {
      rowErr.marks = "Must be at least 1";
    }

    if (Object.keys(rowErr).length > 0) {
      errors.rows[qt.id] = rowErr;
    }
  });

  // 3. File validation (if provided)
  if (file) {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(file.type)) {
      errors.file = "Only PDF, DOCX, or TXT files up to 10MB are supported";
    } else if (file.size > 10 * 1024 * 1024) {
      errors.file = "Only PDF, DOCX, or TXT files up to 10MB are supported";
    }
  }

  // 4. Due date validation (if provided)
  if (dueDate) {
    const today = new Date().toISOString().split("T")[0];
    if (dueDate < today) {
      errors.dueDate = "Due date must be in the future";
    }
  }

  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  if (errors.assignmentName) return true;
  if (errors.questionTypes) return true;
  if (errors.dueDate) return true;
  if (errors.file) return true;
  if (Object.keys(errors.rows).length > 0) return true;
  return false;
}

/* ═══════════════════════════════════════════════════════════════ */
/*                      MAIN PAGE COMPONENT                       */
/* ═══════════════════════════════════════════════════════════════ */
export default function CreateAssignmentPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const {
    assignmentName,
    file,
    dueDate,
    questionTypes,
    additionalInfo,
    totalQuestions,
    totalMarks,
    setAssignmentName,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
    resetForm,
  } = useAssignmentFormStore();

  const setAssignmentId = useGenerationStore((s) => s.setAssignmentId);
  const setStatus = useGenerationStore((s) => s.setStatus);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({ rows: {} });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const scrollToFirstError = useCallback(() => {
    // Scroll to the first error element in the form
    setTimeout(() => {
      const errorEl = formRef.current?.querySelector("[data-error='true']");
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, []);

  const handleSubmit = useCallback(async () => {
    // 1. Validate
    const validationErrors = validateForm(assignmentName, questionTypes, dueDate, file);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      scrollToFirstError();
      return;
    }

    // 2. Build FormData
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      if (assignmentName.trim()) {
        formData.append("assignmentName", assignmentName.trim());
      }
      if (file) {
        formData.append("file", file);
      }
      if (dueDate) {
        formData.append("dueDate", dueDate);
      }
      formData.append(
        "questionTypes",
        JSON.stringify(
          questionTypes.map((qt) => ({
            type: qt.type,
            count: qt.count,
            marks: qt.marks,
          }))
        )
      );
      if (additionalInfo.trim()) {
        formData.append("additionalInfo", additionalInfo);
      }

      // 3. POST to API
      const response = await axiosInstance.post("/api/assignments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 4. Handle response
        const fetchedAssignmentId = response.data?.assignment?._id || response.data?.assignmentId || response.data?._id;
        
        const validId = fetchedAssignmentId ? fetchedAssignmentId.toString() : "";
        if (!validId) {
          throw new Error("Assignment created, but no assignment id was returned.");
        }
        setAssignmentId(validId);
        setStatus("pending");
        resetForm();
        router.push(`/assignments/${validId}`);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create assignment. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    assignmentName,
    questionTypes,
    dueDate,
    file,
    additionalInfo,
    scrollToFirstError,
    setAssignmentId,
    setStatus,
    resetForm,
    router,
  ]);

  return (
    <AppLayout>
      <div
        ref={formRef}
        className="relative w-full flex flex-col gap-8"
      >
        {/* ── HEADER ── */}
        {/* Mobile header */}
        <div className="flex w-full items-center gap-3 lg:hidden relative animate-fade-in-up">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.push("/assignments")}
            className="btn-press flex h-12 w-12 items-center justify-center rounded-full bg-white/25 backdrop-blur-[12px] shrink-0 transition-transform active:scale-95"
          >
            <ArrowLeft className="h-6 w-6 text-[#303030]" strokeWidth={2.5} />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 font-bricolage text-base font-bold tracking-[-0.04em] text-[#303030]">
            Create Assignment
          </h1>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex w-full items-center gap-3 px-2 pt-1 animate-fade-in-up">
          {/* Breadcrumb */}
          <button
            type="button"
            onClick={() => router.push("/assignments")}
            className="btn-press font-bricolage text-sm font-medium tracking-[-0.04em] text-[rgba(94,94,94,0.55)] hover:text-[#303030] transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Assignment
          </button>
        </div>

        <div className="hidden lg:flex w-full items-center gap-3 px-2 animate-fade-in-up">
          {/* Status dot */}
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
          <div className="flex flex-col gap-0.5">
            <h1 className="font-bricolage text-xl font-bold tracking-[-0.04em] text-[#303030]">
              Create Assignment
            </h1>
            <p className="font-bricolage text-sm font-normal tracking-[-0.04em] text-[rgba(94,94,94,0.55)]">
              Set up a new assignment for your students
            </p>
          </div>
        </div>

        {/* ── STEP INDICATOR ── */}
        <div className="w-full animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <StepIndicator currentStep={1} totalSteps={2} />
        </div>

        {/* ── MAIN CARD ── */}
        <div
          className="w-full rounded-[32px] glass p-4 lg:p-8 flex flex-col gap-6 lg:gap-8 animate-scale-in overflow-visible"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Title block */}
          <div className="flex flex-col gap-0.5">
            <h2 className="font-bricolage text-xl font-bold tracking-[-0.04em] text-[#303030]">
              Assignment Details
            </h2>
            <p className="font-bricolage text-sm font-normal tracking-[-0.04em] text-[rgba(94,94,94,0.8)]">
              Basic information about your assignment
            </p>
          </div>

          {/* ── FORM CONTENT ── */}
          <div className="flex flex-col gap-6 overflow-visible">
            {/* 0. Assignment Name */}
            <div className="flex flex-col gap-2">
              <label className="font-bricolage text-base font-bold tracking-[-0.04em] text-[#303030]">
                Assignment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
                placeholder="e.g. Science Mid-Term Evaluation"
                className="w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 font-bricolage text-base outline-none focus:border-[#303030] transition-colors"
              />
              {errors.assignmentName && (
                <p data-error="true" className="font-bricolage text-xs font-medium text-red-500">
                  {errors.assignmentName}
                </p>
              )}
            </div>

            {/* 1. File Upload */}
            <FileUpload />

            {/* File error from form validation */}
            {errors.file && (
              <p
                data-error="true"
                className="font-bricolage text-xs font-medium text-red-500 -mt-4"
              >
                {errors.file}
              </p>
            )}

            {/* 2. Due Date */}
            <DueDatePicker />
            {errors.dueDate && (
              <p
                data-error="true"
                className="font-bricolage text-xs font-medium text-red-500 -mt-4"
              >
                {errors.dueDate}
              </p>
            )}

            {/* 3. Question Types Section */}
            <div className="relative z-10 flex flex-col gap-4">
              {/* Global question types error */}
              {errors.questionTypes && (
                <p
                  data-error="true"
                  className="font-bricolage text-xs font-medium text-red-500"
                >
                  {errors.questionTypes}
                </p>
              )}

              {/* Desktop column headers */}
              <div className="hidden lg:grid lg:grid-cols-[1fr_100px_100px] lg:gap-3 items-end">
                <span className="font-bricolage text-base font-bold tracking-[-0.04em] text-[#303030]">
                  Question Type
                </span>
                <span className="font-bricolage text-sm font-medium tracking-[-0.04em] text-[#303030] text-center">
                  No. of Questions
                </span>
                <span className="font-bricolage text-sm font-medium tracking-[-0.04em] text-[#303030] text-center">
                  Marks
                </span>
              </div>

              {/* Mobile label */}
              <span className="lg:hidden font-bricolage text-base font-bold tracking-[-0.04em] text-[#303030]">
                Question Type
              </span>

              {/* Rows */}
              {questionTypes.map((qt, index) => (
                <QuestionTypeRow
                  key={qt.id}
                  entry={qt}
                  index={index}
                  onRemove={removeQuestionType}
                  onUpdate={updateQuestionType}
                  showRemove={questionTypes.length > 1}
                  errors={errors.rows[qt.id]}
                />
              ))}

              {/* Add + Totals footer */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Add Question Type */}
                <button
                  type="button"
                  onClick={addQuestionType}
                  className="btn-press flex items-center gap-2 transition-transform active:scale-95"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B2B2B]">
                    <Plus className="h-5 w-5 text-white" />
                  </span>
                  <span className="font-bricolage text-sm font-bold tracking-[-0.04em] text-[#303030]">
                    Add Question Type
                  </span>
                </button>

                {/* Totals */}
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bricolage text-base font-medium tracking-[-0.04em] text-[#303030] leading-[110%]">
                    Total Questions : {totalQuestions}
                  </span>
                  <span className="font-bricolage text-base font-medium tracking-[-0.04em] text-[#303030] leading-[110%]">
                    Total Marks : {totalMarks}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Additional Info */}
            <div className="relative z-0">
              <AdditionalInfoTextarea />
            </div>
          </div>
        </div>

        {/* ── SUBMIT ERROR ── */}
        {submitError && (
          <div className="w-full rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="font-bricolage text-sm font-medium text-red-600">
              {submitError}
            </p>
          </div>
        )}

        {/* ── FOOTER BUTTONS ── */}
        <div className="flex w-full items-center justify-center lg:justify-between gap-3 pb-4">
          <button
            type="button"
            onClick={() => router.push("/assignments")}
            className="btn-press flex items-center gap-1 rounded-full glass-light px-6 py-3 font-bricolage text-base font-medium tracking-[-0.04em] text-[#303030] transition-all hover:bg-white/60 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Previous</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-press flex items-center gap-1 rounded-full glass-dark px-6 py-3 font-bricolage text-base font-medium tracking-[-0.04em] text-white transition-all hover:bg-[rgba(24,24,24,0.8)] active:scale-95 shadow-[0px_16px_48px_rgba(0,0,0,0.12),0px_32px_48px_rgba(0,0,0,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
