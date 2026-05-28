"use client";

import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
  "Fill in the Blanks",
  "True/False",
  "Match the Following",
] as const;

interface QuestionTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function QuestionTypeSelector({
  value,
  onChange,
  error,
}: QuestionTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex-1" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className={`flex items-center justify-between rounded-full bg-white/60 backdrop-blur-sm border px-4 py-[11px] gap-4 w-full h-[44px] transition-colors ${
          error
            ? "border-red-400"
            : isOpen
            ? "border-[#5E5E5E]"
            : "border-white/40"
        }`}
      >
        <span
          className={`font-bricolage text-base font-medium tracking-[-0.04em] whitespace-nowrap truncate ${
            value ? "text-[#303030]" : "text-[#A9A9A9]"
          }`}
        >
          {value || "Select question type"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#303030] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          strokeWidth={1.5}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-2xl bg-white border border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)] py-1 max-h-[240px] overflow-y-auto">
          {QUESTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(type);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 font-bricolage text-sm font-medium tracking-[-0.04em] transition-colors ${
                type === value
                  ? "bg-[#F0F0F0] text-[#303030]"
                  : "text-[#5E5E5E] hover:bg-[#F6F6F6] hover:text-[#303030]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 font-bricolage text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
