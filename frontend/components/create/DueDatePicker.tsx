"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useAssignmentFormStore } from "@/store/assignmentFormStore";
import { useState, useRef, useEffect } from "react";

export default function DueDatePicker() {
  const { dueDate, setDueDate } = useAssignmentFormStore();
  const [isOpen, setIsOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  
  // Custom calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const isInvalid = touched && dueDate !== "" && dueDate < todayStr;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setTouched(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Adjust for local timezone offset
    selectedDate.setMinutes(selectedDate.getMinutes() - selectedDate.getTimezoneOffset());
    setDueDate(selectedDate.toISOString().split("T")[0]);
    setIsOpen(false);
    setTouched(true);
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select a date...";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const todayDate = new Date();
  todayDate.setHours(0,0,0,0);

  return (
    <div className="flex flex-col gap-2 relative" ref={pickerRef}>
      <span className="font-bricolage text-base font-bold tracking-[-0.04em] text-[#303030]">
        Due Date
      </span>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-between rounded-full border bg-white/40 backdrop-blur-sm px-4 py-[11px] h-[44px] cursor-pointer transition-colors hover:border-[#5E5E5E] ${
          isInvalid ? "border-red-400" : (isOpen ? "border-[#5E5E5E]" : "border-white/40")
        }`}
      >
        <span className={`font-bricolage text-sm font-medium tracking-[-0.04em] ${dueDate ? "text-[#303030]" : "text-[#A9A9A9]"}`}>
          {formatDisplayDate(dueDate)}
        </span>
        <CalendarDays className="h-5 w-5 text-[#2B2B2B] shrink-0" strokeWidth={1.5} />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-white rounded-3xl shadow-xl border border-white/60 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bricolage font-bold text-sm">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <span key={day} className="text-xs font-medium text-gray-400">{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isPast = dateToCheck < todayDate;
              const isSelected = dueDate === new Date(dateToCheck.getTime() - dateToCheck.getTimezoneOffset() * 60000).toISOString().split("T")[0];
              
              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => handleDateSelect(day)}
                  className={`h-8 w-8 rounded-full text-sm font-medium transition-all ${
                    isSelected 
                      ? "bg-black text-white shadow-md hover:bg-black/90" 
                      : isPast
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error message */}
      {isInvalid && (
        <p className="font-bricolage text-xs font-medium text-red-500">
          Due date must be in the future
        </p>
      )}
    </div>
  );
}
