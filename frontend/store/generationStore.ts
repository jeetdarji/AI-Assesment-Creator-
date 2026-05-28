// filepath: frontend/store/generationStore.ts
// description: Zustand store for tracking AI generation job state.

import { create } from "zustand";

type GenerationStatus = "idle" | "pending" | "processing" | "completed" | "failed";

interface GenerationState {
  assignmentId: string | null;
  status: GenerationStatus;
  error: string | null;
}

interface GenerationActions {
  setAssignmentId: (id: string) => void;
  setStatus: (status: GenerationStatus) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGenerationStore = create<GenerationState & GenerationActions>()((set) => ({
  assignmentId: null,
  status: "idle",
  error: null,

  setAssignmentId: (id: string) => {
    set({ assignmentId: id });
  },
  setStatus: (status: GenerationStatus) => {
    set({ status });
  },
  setError: (error: string | null) => {
    set({ error });
  },
  reset: () => {
    set({ assignmentId: null, status: "idle", error: null });
  },
}));
