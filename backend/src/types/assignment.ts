// filepath: backend/src/types/assignment.ts
// description: Shared TypeScript types for assignments on the backend.

export interface QuestionTypeEntry {
  type: string;
  count: number;
  marks: number;
}

export type AssignmentStatus = "pending" | "processing" | "completed" | "failed";

export interface IAssignment {
  _id: string;
  assignmentName?: string;
  status: AssignmentStatus;
  dueDate?: Date;
  fileUrl?: string | null;
  fileName?: string | null;
  referenceContent?: string;
  questionTypes: QuestionTypeEntry[];
  additionalInfo?: string;
  totalQuestions: number;
  totalMarks: number;
  createdAt: Date;
  updatedAt: Date;
}
