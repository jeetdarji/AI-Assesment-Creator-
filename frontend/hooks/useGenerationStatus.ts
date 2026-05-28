// filepath: frontend/hooks/useGenerationStatus.ts
// description: Hook that listens for WebSocket generation events and updates generationStore.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "./useSocket";
import { useGenerationStore } from "@/store/generationStore";

interface GenerationStartedPayload {
  assignmentId: string;
  status?: "pending" | "processing" | "completed" | "failed";
}

interface GenerationCompletePayload {
  assignmentId: string;
  status?: "pending" | "processing" | "completed" | "failed";
}

interface GenerationFailedPayload {
  assignmentId: string;
  status?: "pending" | "processing" | "completed" | "failed";
  error: string;
}

export function useGenerationStatus(assignmentId: string): void {
  const socket = useSocket();
  const router = useRouter();
  const setStatus = useGenerationStore((s) => s.setStatus);
  const setError = useGenerationStore((s) => s.setError);

  useEffect(() => {
    if (!assignmentId) return;

    const handleStarted = (payload: GenerationStartedPayload) => {
      if (payload.assignmentId === assignmentId) {
        setStatus("processing");
      }
    };

    const handleComplete = (payload: GenerationCompletePayload) => {
      if (payload.assignmentId === assignmentId) {
        setStatus("completed");
        router.push(`/assignments/${assignmentId}/output`);
      }
    };

    const handleFailed = (payload: GenerationFailedPayload) => {
      if (payload.assignmentId === assignmentId) {
        setStatus("failed");
        setError(payload.error);
      }
    };

    const handleAssignmentStatus = (
      payload: GenerationStartedPayload | GenerationCompletePayload | GenerationFailedPayload
    ) => {
      if (payload.assignmentId !== assignmentId) return;
      if (payload.status === "completed") {
        setStatus("completed");
        router.push(`/assignments/${assignmentId}/output`);
        return;
      }
      if (payload.status === "failed") {
        setStatus("failed");
        setError("Generation failed. Please try again.");
        return;
      }
      if (payload.status) {
        setStatus(payload.status);
      }
    };

    socket.on("generation:started", handleStarted);
    socket.on("generation:complete", handleComplete);
    socket.on("generation:failed", handleFailed);
    socket.on("assignment:status", handleAssignmentStatus);

    return () => {
      socket.off("generation:started", handleStarted);
      socket.off("generation:complete", handleComplete);
      socket.off("generation:failed", handleFailed);
      socket.off("assignment:status", handleAssignmentStatus);
    };
  }, [assignmentId, socket, router, setStatus, setError]);
}

export default useGenerationStatus;
