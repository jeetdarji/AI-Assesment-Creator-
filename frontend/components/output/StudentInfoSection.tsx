"use client";

interface StudentInfoSectionProps {
  classGrade: string;
}

export default function StudentInfoSection({ classGrade }: StudentInfoSectionProps) {
  return (
    <div className="flex flex-col gap-4 py-4">
      {/* General Instructions */}
      <h3 className="font-bricolage text-base lg:text-lg font-bold tracking-[-0.04em] text-[#303030]">
        General Instructions:
      </h3>
      <ul className="list-disc pl-5 font-bricolage text-sm lg:text-base font-normal tracking-[-0.04em] text-[#303030] flex flex-col gap-1 -mt-2">
        <li>All questions are compulsory unless stated otherwise.</li>
        <li>Read the instructions for each section carefully before answering.</li>
      </ul>

      <div className="flex flex-col gap-3 py-2 mt-2">
        {/* Name */}
        <div className="flex items-baseline gap-2">
          <span className="font-bricolage text-base lg:text-lg font-medium tracking-[-0.04em] text-[#303030] whitespace-nowrap">
            Name:
          </span>
          <span className="flex-1 border-b border-black min-w-[200px]" />
        </div>

        {/* Roll Number */}
        <div className="flex items-baseline gap-2">
          <span className="font-bricolage text-base lg:text-lg font-medium tracking-[-0.04em] text-[#303030] whitespace-nowrap">
            Roll Number:
          </span>
          <span className="flex-1 border-b border-black min-w-[200px]" />
        </div>

        {/* Class + Section */}
        <div className="flex items-baseline gap-8">
          <div className="flex items-baseline gap-2">
            <span className="font-bricolage text-base lg:text-lg font-medium tracking-[-0.04em] text-[#303030] whitespace-nowrap">
              Class: {classGrade}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bricolage text-base lg:text-lg font-medium tracking-[-0.04em] text-[#303030] whitespace-nowrap">
              Section:
            </span>
            <span className="w-32 border-b border-black" />
          </div>
        </div>
      </div>
    </div>
  );
}
