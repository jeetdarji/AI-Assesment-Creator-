"use client";

import { SectionItem } from "@/types/output";
import QuestionItem from "./QuestionItem";

interface QuestionSectionProps {
  section: SectionItem;
}

export default function QuestionSection({ section }: QuestionSectionProps) {
  return (
    <div className="flex flex-col gap-6 py-6 border-b border-gray-200 last:border-b-0">
      {/* Section title with lines */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-[1px] flex-1 bg-gray-300" />
        <h3 className="font-bricolage text-lg lg:text-xl font-bold tracking-[-0.04em] text-[#303030] text-center uppercase">
          {section.title}
        </h3>
        <div className="h-[1px] flex-1 bg-gray-300" />
      </div>

      {/* Section instruction */}
      {section.instruction && (
        <p className="font-bricolage text-base font-medium tracking-[-0.04em] text-[rgba(94,94,94,0.9)] italic">
          {section.instruction}
        </p>
      )}

      {/* Questions */}
      <div className="flex flex-col gap-2 mt-2">
        {section.questions.map((q) => (
          <QuestionItem key={q.number} question={q} />
        ))}
      </div>
    </div>
  );
}
