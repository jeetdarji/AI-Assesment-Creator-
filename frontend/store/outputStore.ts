// filepath: frontend/store/outputStore.ts
// description: Zustand store for holding the AI-generated assessment output.

import { create } from "zustand";
import { GeneratedOutput } from "@/types/output";

interface OutputState {
  output: GeneratedOutput | null;
  loading: boolean;
  error: string | null;
}

interface OutputActions {
  setOutput: (output: GeneratedOutput) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearOutput: () => void;
}

export const useOutputStore = create<OutputState & OutputActions>()((set) => ({
  output: null,
  loading: false,
  error: null,

  setOutput: (output: GeneratedOutput) => {
    set({ output, loading: false, error: null });
  },
  setLoading: (loading: boolean) => {
    set({ loading });
  },
  setError: (error: string | null) => {
    set({ error, loading: false });
  },
  clearOutput: () => {
    set({ output: null, loading: false, error: null });
  },
}));
