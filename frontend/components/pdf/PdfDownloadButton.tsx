"use client";

import { BlobProvider } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import QuestionPaperPDF from "./QuestionPaperPDF";
import { GeneratedOutput } from "@/types/output";

interface PdfDownloadButtonProps {
  data: GeneratedOutput;
  assignmentId: string;
  className?: string;
}

/**
 * Self-contained PDF download button that uses BlobProvider internally.
 * Must be dynamically imported with { ssr: false } to avoid SSR crashes.
 */
export default function PdfDownloadButton({
  data,
  assignmentId,
  className = "",
}: PdfDownloadButtonProps) {
  return (
    <BlobProvider document={<QuestionPaperPDF data={data} />}>
      {({ blob, url, loading, error }) => {
        if (error) {
          return (
            <button
              type="button"
              disabled
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-bricolage text-sm font-medium tracking-[-0.04em] opacity-60 ${className}`}
            >
              <Download className="h-4 w-4" />
              <span>PDF Error</span>
            </button>
          );
        }

        if (loading || !blob || !url) {
          return (
            <button
              type="button"
              disabled
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-bricolage text-sm font-medium tracking-[-0.04em] opacity-60 ${className}`}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Preparing PDF…</span>
            </button>
          );
        }

        return (
          <a
            href={url}
            download={`question-paper-${assignmentId}.pdf`}
            className={`btn-press flex items-center gap-2 rounded-full px-5 py-2.5 font-bricolage text-sm font-medium tracking-[-0.04em] transition-all active:scale-95 ${className}`}
          >
            <Download className="h-4 w-4" />
            <span>Download as PDF</span>
          </a>
        );
      }}
    </BlobProvider>
  );
}
