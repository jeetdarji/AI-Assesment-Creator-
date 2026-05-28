"use client";

import { AnswerKeyItem } from "@/types/output";

interface AnswerKeyProps {
  answerKey: AnswerKeyItem[];
}

export default function AnswerKey({ answerKey }: AnswerKeyProps) {
  if (!answerKey || answerKey.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 py-8 border-t-[3px] border-dashed border-gray-300 mt-8">
      {/* Heading */}
      <h3 className="font-bricolage text-xl font-bold tracking-[-0.04em] text-[#303030] uppercase text-center mb-4">
        Answer Key & Explanations
      </h3>

      {/* Answer list */}
      <div className="flex flex-col gap-6">
        {answerKey.map((item) => (
          <div key={item.questionNumber} className="flex flex-col gap-1 break-inside-avoid">
            <div className="flex items-start gap-3">
              <span className="font-bricolage text-base font-bold tracking-[-0.04em] text-[#303030] shrink-0 min-w-[24px]">
                {item.questionNumber}.
              </span>
              <p className="font-bricolage text-base font-medium tracking-[-0.04em] text-[#303030]">
                {item.answer}
              </p>
            </div>
            {item.explanation && (
              <div className="pl-9 font-bricolage text-sm italic font-normal tracking-[-0.04em] text-gray-500">
                Explanation: {item.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
