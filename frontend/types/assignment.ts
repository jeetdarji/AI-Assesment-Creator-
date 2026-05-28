// filepath: frontend/types/assignment.ts
// description: Shared TypeScript types for assignments on the frontend (mirrors backend types).

export interface QuestionTypeEntry {
  type: string;
  count: number;
  marks: number;
}

export type AssignmentStatus = "pending" | "processing" | "completed" | "failed";

export interface IAssignment {
  _id: string;
  status: AssignmentStatus;
  dueDate?: Date;
  fileUrl?: string | null;
  fileName?: string | null;
  questionTypes: QuestionTypeEntry[];
  additionalInfo?: string;
  totalQuestions: number;
  totalMarks: number;
  createdAt: Date;
  updatedAt: Date;
}
