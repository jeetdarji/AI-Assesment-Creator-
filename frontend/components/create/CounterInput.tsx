"use client";

import { Minus, Plus } from "lucide-react";

interface CounterInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export default function CounterInput({
  value,
  onChange,
  min = 1,
  max = 100,
  label,
}: CounterInputProps) {
  const isMin = value <= min;
  const isMax = value >= max;

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="font-bricolage text-xs font-medium tracking-[-0.04em] text-[rgba(94,94,94,0.8)]">
          {label}
        </span>
      )}
      <div className="flex items-center justify-between rounded-full bg-white/60 backdrop-blur-sm border border-white/40 px-2 py-[7px] lg:px-2 lg:py-[11px] w-[100px] lg:w-[100px] h-[38px] lg:h-[44px]">
        <button
          type="button"
          onClick={() => !isMin && onChange(value - 1)}
          disabled={isMin}
          className="flex h-4 w-4 items-center justify-center transition-transform active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Decrease"
        >
          <Minus className="h-4 w-4 text-[#DADADA]" strokeWidth={1.5} />
        </button>
        <span className="font-bricolage text-base font-medium tracking-[-0.04em] text-[#303030] tabular-nums select-none min-w-[28px] text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={() => !isMax && onChange(value + 1)}
          disabled={isMax}
          className="flex h-4 w-4 items-center justify-center transition-transform active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Increase"
        >
          <Plus className="h-4 w-4 text-[#DADADA]" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
