"use client";

import { Mic, MicOff } from "lucide-react";
import { useAssignmentFormStore } from "@/store/assignmentFormStore";
import { useState, useRef, useEffect, useCallback } from "react";

interface SpeechRecognitionResultAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionResultAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const MAX_LENGTH = 1000;

export default function AdditionalInfoTextarea() {
  const { additionalInfo, setAdditionalInfo } = useAssignmentFormStore();
  
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        if (interim) {
          setInterimText(interim);
        }
        
        if (final) {
          const prev = useAssignmentFormStore.getState().additionalInfo;
          const newText = prev ? `${prev} ${final}` : final;
          setAdditionalInfo(newText.slice(0, MAX_LENGTH));
          setInterimText("");
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        setInterimText("");
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow microphone.");
        } else {
          setError(`Microphone error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
    }
  }, [setAdditionalInfo]);

  const toggleListen = useCallback(() => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  }, [isListening]);

  const isBrowserSupported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div className="flex flex-col gap-2">
      <span className="font-bricolage text-base font-bold tracking-[-0.04em] text-[#303030]">
        Additional Information (For better output)
      </span>
      <div className="relative flex flex-col justify-between rounded-2xl border border-white/60 shadow-sm bg-white/30 backdrop-blur-sm p-4 min-h-[102px] transition-colors focus-within:border-white/80 focus-within:shadow-md">
        <textarea
          value={additionalInfo}
          onChange={(e) => {
            if (e.target.value.length <= MAX_LENGTH) {
              setAdditionalInfo(e.target.value);
            }
          }}
          placeholder="e.g. Generate a question paper for 3 hour exam duration..."
          rows={4}
          maxLength={MAX_LENGTH}
          className="bg-transparent font-bricolage text-sm font-medium tracking-[-0.04em] text-[#303030] placeholder:text-[rgba(48,48,48,0.6)] outline-none focus:outline-none focus:ring-0 border-none resize-none w-full pr-12 pb-2"
        />

        {interimText && (
          <div className="font-bricolage text-sm italic text-gray-400 mb-2">
            {interimText}
          </div>
        )}

        <div className="flex justify-between items-end mt-2">
          <div className="flex flex-col">
            {isListening && (
              <span className="font-bricolage text-xs text-red-500 animate-pulse">
                Listening...
              </span>
            )}
            {error && (
              <span className="font-bricolage text-xs text-red-500">
                {error}
              </span>
            )}
          </div>
          <span className="font-bricolage text-xs font-medium tracking-[-0.04em] text-[rgba(94,94,94,0.55)]">
            {additionalInfo.length}/{MAX_LENGTH}
          </span>
        </div>

        {/* Mic icon */}
        <div className="absolute top-4 right-4 group">
          <button
            type="button"
            tabIndex={-1}
            onClick={toggleListen}
            disabled={!isBrowserSupported}
            className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm border transition-all active:scale-90 ${
              !isBrowserSupported
                ? "bg-gray-200 border-gray-300 cursor-not-allowed opacity-50"
                : isListening
                ? "bg-red-100 border-red-300 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                : "bg-white/50 border-white/30 hover:bg-white/70"
            }`}
            title={!isBrowserSupported ? "Voice input not supported in this browser" : isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-red-600" />
            ) : (
              <Mic className="h-4 w-4 text-[#303030]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
