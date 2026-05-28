// filepath: frontend/types/output.ts
// description: Shared TypeScript types for AI-generated assessment outputs (mirrors backend types).

export interface QuestionItem {
  number: number;
  text: string;
  options?: string[];
  difficulty: "Easy" | "Moderate" | "Hard";
  marks: number;
  type: string;
}

export interface SectionItem {
  title: string;
  instruction: string;
  questions: QuestionItem[];
}

export interface AnswerKeyItem {
  questionNumber: number;
  answer: string;
  explanation?: string;
}

export interface GeneratedOutput {
  schoolName: string;
  subject: string;
  classGrade: string;
  timeAllowed: string;
  maxMarks: number;
  sections: SectionItem[];
  answerKey: AnswerKeyItem[];
}

export interface IOutput extends GeneratedOutput {
  _id: string;
  assignmentId: string;
  generatedAt: Date;
}
