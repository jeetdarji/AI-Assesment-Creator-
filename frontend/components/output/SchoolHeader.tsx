"use client";

interface SchoolHeaderProps {
  schoolName: string;
  subject: string;
  classGrade: string;
  timeAllowed: string;
  maxMarks: number;
}

export default function SchoolHeader({
  schoolName,
  subject,
  classGrade,
  timeAllowed,
  maxMarks,
}: SchoolHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* School name */}
      <h1 className="font-bricolage text-2xl lg:text-3xl font-bold tracking-[-0.04em] text-[#303030] text-center uppercase mb-1">
        {schoolName}
      </h1>

      {/* Subject */}
      <p className="font-bricolage text-base lg:text-lg font-semibold tracking-[-0.04em] text-[#303030] text-center">
        Subject: {subject}
      </p>

      {/* Class */}
      <p className="font-bricolage text-base lg:text-lg font-semibold tracking-[-0.04em] text-[#303030] text-center">
        Class: {classGrade}
      </p>

      {/* Divider */}
      <div className="w-full h-px bg-black my-4" />

      {/* Time + Marks row */}
      <div className="flex w-full items-center justify-between">
        <span className="font-bricolage text-sm lg:text-base font-bold tracking-[-0.04em] text-[#303030]">
          Time Allowed: {timeAllowed}
        </span>
        <span className="font-bricolage text-sm lg:text-base font-bold tracking-[-0.04em] text-[#303030]">
          Maximum Marks: {maxMarks}
        </span>
      </div>
    </div>
  );
}
