"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import axiosInstance from "@/lib/axios";
import { useOutputStore } from "@/store/outputStore";
import { useGenerationStore } from "@/store/generationStore";
import { GeneratedOutput } from "@/types/output";

/**
 * Dynamically import the self-contained PDF download button with SSR disabled.
 * @react-pdf/renderer uses browser-only APIs and crashes during Next.js SSR.
 */
const PdfDownloadButton = dynamic(
  () => import("@/components/pdf/PdfDownloadButton"),
  { ssr: false, loading: () => null }
);

interface ActionBarProps {
  assignmentId: string;
  output: GeneratedOutput;
  showDownload?: boolean;
}

export default function ActionBar({ assignmentId, output, showDownload = true }: ActionBarProps) {
  const router = useRouter();
  const clearOutput = useOutputStore((s) => s.clearOutput);
  const setStatus = useGenerationStore((s) => s.setStatus);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    setRegenerateError(null);

    try {
      await axiosInstance.post(`/api/assignments/${assignmentId}/retry`);
      clearOutput();
      setStatus("pending");
      router.push(`/assignments/${assignmentId}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to regenerate. Please try again.";
      setRegenerateError(message);
    } finally {
      setIsRegenerating(false);
    }
  }, [assignmentId, clearOutput, setStatus, router]);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Download PDF */}
      {showDownload && (
        <PdfDownloadButton
          data={output}
          assignmentId={assignmentId}
          className="border border-white/60 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
        />
      )}

      {/* Regenerate */}
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={isRegenerating}
        className="btn-press flex items-center gap-2 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm px-5 py-2.5 font-bricolage text-sm font-medium tracking-[-0.04em] text-white transition-all hover:bg-white/30 active:scale-95 disabled:opacity-60"
      >
        {isRegenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        <span>Regenerate</span>
      </button>

      {/* Inline error */}
      {regenerateError && (
        <span className="font-bricolage text-xs font-medium text-red-300">
          {regenerateError}
        </span>
      )}
    </div>
  );
}
