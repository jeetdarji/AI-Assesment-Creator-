// filepath: frontend/store/assignmentFormStore.ts
// description: Zustand store for the assignment creation form state.

import { create } from "zustand";

export interface QuestionTypeEntry {
  id: string;
  type: string;
  count: number;
  marks: number;
}

interface AssignmentFormState {
  assignmentName: string;
  file: File | null;
  filePreviewUrl: string | null;
  dueDate: string;
  questionTypes: QuestionTypeEntry[];
  additionalInfo: string;
  totalQuestions: number;
  totalMarks: number;
}

interface AssignmentFormActions {
  setAssignmentName: (name: string) => void;
  setFile: (file: File | null) => void;
  clearFile: () => void;
  setDueDate: (date: string) => void;
  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (id: string, field: keyof QuestionTypeEntry, value: string | number) => void;
  setAdditionalInfo: (info: string) => void;
  resetForm: () => void;
}

function computeTotals(types: QuestionTypeEntry[]) {
  return {
    totalQuestions: types.reduce((s, t) => s + t.count, 0),
    totalMarks: types.reduce((s, t) => s + t.count * t.marks, 0),
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `qt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const INITIAL_QUESTION_TYPES: QuestionTypeEntry[] = [
  { id: generateId(), type: "", count: 1, marks: 1 },
];

export const useAssignmentFormStore = create<AssignmentFormState & AssignmentFormActions>()((set) => ({
  assignmentName: "",
  file: null,
  filePreviewUrl: null,
  dueDate: "",
  questionTypes: INITIAL_QUESTION_TYPES,
  additionalInfo: "",
  ...computeTotals(INITIAL_QUESTION_TYPES),

  setAssignmentName: (name) => set({ assignmentName: name }),

  setFile: (file) => {
    const url = file ? URL.createObjectURL(file) : null;
    set((s) => {
      if (s.filePreviewUrl) URL.revokeObjectURL(s.filePreviewUrl);
      return { file, filePreviewUrl: url };
    });
  },

  clearFile: () =>
    set((s) => {
      if (s.filePreviewUrl) URL.revokeObjectURL(s.filePreviewUrl);
      return { file: null, filePreviewUrl: null };
    }),

  setDueDate: (date) => set({ dueDate: date }),

  addQuestionType: () =>
    set((s) => {
      const next = [
        ...s.questionTypes,
        { id: generateId(), type: "", count: 1, marks: 1 },
      ];
      return { questionTypes: next, ...computeTotals(next) };
    }),

  removeQuestionType: (id) =>
    set((s) => {
      const next = s.questionTypes.filter((q) => q.id !== id);
      return { questionTypes: next, ...computeTotals(next) };
    }),

  updateQuestionType: (id, field, value) =>
    set((s) => {
      const next = s.questionTypes.map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      );
      return { questionTypes: next, ...computeTotals(next) };
    }),

  setAdditionalInfo: (info) => set({ additionalInfo: info }),

  resetForm: () =>
    set((s) => {
      if (s.filePreviewUrl) URL.revokeObjectURL(s.filePreviewUrl);
      const freshTypes: QuestionTypeEntry[] = [
        { id: generateId(), type: "", count: 1, marks: 1 },
      ];
      return {
        assignmentName: "",
        file: null,
        filePreviewUrl: null,
        dueDate: "",
        questionTypes: freshTypes,
        additionalInfo: "",
        ...computeTotals(freshTypes),
      };
    }),
}));
