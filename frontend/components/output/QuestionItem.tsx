"use client";

import DifficultyBadge from "./DifficultyBadge";
import { QuestionItem as QuestionItemType } from "@/types/output";

interface QuestionItemProps {
  question: QuestionItemType;
}

export default function QuestionItem({ question }: QuestionItemProps) {
  const isMcq = question.type.toLowerCase().includes("multiple choice") || question.type.toLowerCase() === "mcq" || (question.options && question.options.length > 0);
  const isLongAnswer = question.type.toLowerCase().includes("long answer") || question.type.toLowerCase().includes("essay");

  return (
    <div className="flex flex-col mb-4 break-inside-avoid">
      <div className="flex items-start gap-3 py-1.5">
        <span className="font-bricolage text-base font-bold tracking-[-0.04em] text-[#303030] shrink-0 min-w-[24px]">
          {question.number}.
        </span>

        <p className="font-bricolage text-base font-normal tracking-[-0.04em] text-[#303030] flex-1 leading-relaxed">
          {question.text}
        </p>

        <div className="shrink-0 flex items-center gap-3">
          <DifficultyBadge difficulty={question.difficulty} />
          <span className="font-bricolage text-base font-medium tracking-[-0.04em] text-[#303030] shrink-0 whitespace-nowrap min-w-[60px] text-right">
            [{question.marks}]
          </span>
        </div>
      </div>

      {isMcq && question.options && question.options.length > 0 && (
        <div className="pl-10 mt-2 flex flex-col gap-2">
          {question.options.map((option, idx) => (
            <div key={idx} className="font-bricolage text-base font-normal tracking-[-0.04em] text-[#303030]">
              {option}
            </div>
          ))}
        </div>
      )}

      {isLongAnswer && (
        <div className="pl-10 mt-4 mb-2 flex flex-col gap-8 w-full">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="border-b border-gray-300 w-full" />
          ))}
        </div>
      )}
    </div>
  );
}
