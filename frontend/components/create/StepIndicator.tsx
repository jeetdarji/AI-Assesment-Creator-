"use client";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex w-full flex-col gap-2 px-0 lg:px-[144px]">
      {/* Progress bar */}
      <div className="relative h-[5px] w-full rounded-full bg-[#DADADA] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#5E5E5E] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step label */}
      <span className="font-bricolage text-xs font-medium tracking-[-0.04em] text-[rgba(94,94,94,0.55)]">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}
