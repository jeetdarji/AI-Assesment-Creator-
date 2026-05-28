"use client";

import { Upload, CheckCircle } from "lucide-react";
import { useAssignmentFormStore } from "@/store/assignmentFormStore";
import { useCallback, useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
];

export default function FileUpload() {
  const { file, setFile, clearFile } =
    useAssignmentFormStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateAndSetFile = useCallback(
    (selectedFile: File) => {
      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        setFileError("Supported types: PDF, DOCX, TXT up to 10MB");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError("Supported types: PDF, DOCX, TXT up to 10MB");
        return;
      }
      setFileError(null);
      setFile(selectedFile);
    },
    [setFile]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (files && files[0]) {
        validateAndSetFile(files[0]);
      }
    },
    [validateAndSetFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(() => {
    clearFile();
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [clearFile]);

  return (
    <div className="flex flex-col gap-3">
      {file ? (
        /* ── File selected state ── */
        <div className="flex items-center gap-4 rounded-3xl glass p-4">
          <CheckCircle className="h-6 w-6 text-[#4BC26D] shrink-0" strokeWidth={2} />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-bricolage text-base font-medium tracking-[-0.04em] text-[#303030] truncate">
              {file.name}
            </span>
            <span className="font-bricolage text-sm font-normal tracking-[-0.04em] text-[#A9A9A9]">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="font-bricolage text-sm font-medium tracking-[-0.04em] text-red-500 hover:text-red-600 transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-4 rounded-3xl border-[1.75px] border-dashed px-8 py-6 transition-all duration-300 backdrop-blur-sm ${
            isDragging
              ? "border-[#4BC26D] bg-green-50/30 scale-[1.01]"
              : "border-black/15 bg-white/50 lg:bg-white/50"
          } lg:bg-white/50 bg-[#F6F6F6]/50`}
          style={{ minHeight: 202 }}
        >
          {/* Upload icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <Upload className="h-6 w-6 text-[#1E1E1E]" strokeWidth={2.5} />
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-bricolage text-base font-medium tracking-[-0.04em] text-[#303030]">
              Choose a file or drag &amp; drop it here
            </span>
            <span className="font-bricolage text-sm font-normal tracking-[-0.04em] text-[#A9A9A9]">
              PDF, DOCX, TXT, up to 10MB
            </span>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full bg-[#F6F6F6] lg:bg-[#F6F6F6] px-6 py-2 font-bricolage text-sm font-medium tracking-[-0.04em] text-[#303030] transition-all hover:bg-[#EBEBEB] active:scale-95"
          >
            Browse Files
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}

      {/* Error message */}
      {fileError && (
        <p className="font-bricolage text-xs font-medium text-red-500 text-center">
          {fileError}
        </p>
      )}

      {/* Helper text */}
      {!file && !fileError && (
        <p className="font-bricolage text-base font-medium tracking-[-0.04em] text-[rgba(48,48,48,0.6)] text-center">
          Upload your source document
        </p>
      )}
    </div>
  );
}
