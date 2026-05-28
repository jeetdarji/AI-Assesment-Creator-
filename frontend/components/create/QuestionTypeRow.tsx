"use client";

import { X } from "lucide-react";
import { QuestionTypeEntry } from "@/store/assignmentFormStore";
import QuestionTypeSelector from "./QuestionTypeSelector";
import CounterInput from "./CounterInput";

interface QuestionTypeRowErrors {
  type?: string;
  count?: string;
  marks?: string;
}

interface QuestionTypeRowProps {
  entry: QuestionTypeEntry;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (
    id: string,
    field: keyof QuestionTypeEntry,
    value: string | number
  ) => void;
  showRemove: boolean;
  errors?: QuestionTypeRowErrors;
}

export default function QuestionTypeRow({
  entry,
  index,
  onRemove,
  onUpdate,
  showRemove,
  errors,
}: QuestionTypeRowProps) {
  return (
    <>
      {/* Desktop layout */}
      <div className="hidden lg:flex items-center gap-3 animate-fade-in-up relative" style={{ zIndex: 100 - index }}>
        {/* Question type selector + remove */}
        <div className="flex items-center gap-2 flex-1">
          <QuestionTypeSelector
            value={entry.type}
            onChange={(val) => onUpdate(entry.id, "type", val)}
            error={errors?.type}
          />
          {showRemove && (
            <button
              type="button"
              onClick={() => onRemove(entry.id)}
              className="transition-transform active:scale-90 hover:bg-[#F0F0F0] rounded-full p-1"
              aria-label="Remove question type"
            >
              <X className="h-4 w-4 text-red-500" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Count counter */}
        <div className="flex flex-col items-center">
          <CounterInput
            value={entry.count}
            onChange={(val) => onUpdate(entry.id, "count", val)}
            min={1}
            max={100}
          />
          {errors?.count && (
            <p className="mt-1 font-bricolage text-xs font-medium text-red-500">
              {errors.count}
            </p>
          )}
        </div>

        {/* Marks counter */}
        <div className="flex flex-col items-center">
          <CounterInput
            value={entry.marks}
            onChange={(val) => onUpdate(entry.id, "marks", val)}
            min={1}
            max={100}
          />
          {errors?.marks && (
            <p className="mt-1 font-bricolage text-xs font-medium text-red-500">
              {errors.marks}
            </p>
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex lg:hidden flex-col items-end gap-3 rounded-3xl glass p-3 animate-scale-in relative" style={{ zIndex: 100 - index }}>
        {/* Header row: type selector + remove */}
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex-1">
            <QuestionTypeSelector
              value={entry.type}
              onChange={(val) => onUpdate(entry.id, "type", val)}
              error={errors?.type}
            />
          </div>
          {showRemove && (
            <button
              type="button"
              onClick={() => onRemove(entry.id)}
              className="transition-transform active:scale-90"
              aria-label="Remove question type"
            >
              <X className="h-4 w-4 text-red-500" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Counter area */}
        <div className="flex w-full gap-3 rounded-3xl bg-[#F0F0F0]/60 backdrop-blur-sm border border-white/30 p-2">
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="font-bricolage text-sm font-medium tracking-[-0.04em] text-[#303030]">
              No. of Questions
            </span>
            <CounterInput
              value={entry.count}
              onChange={(val) => onUpdate(entry.id, "count", val)}
              min={1}
              max={100}
            />
          </div>
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="font-bricolage text-sm font-medium tracking-[-0.04em] text-[#303030]">
              Marks
            </span>
            <CounterInput
              value={entry.marks}
              onChange={(val) => onUpdate(entry.id, "marks", val)}
              min={1}
              max={100}
            />
          </div>
        </div>
      </div>
    </>
  );
}
