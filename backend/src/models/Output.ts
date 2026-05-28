import mongoose, { Schema, Document, Types } from "mongoose";
import { SectionItem, QuestionItem, AnswerKeyItem } from "../types/output";

export interface IOutputDocument extends Document {
  assignmentId: Types.ObjectId;
  schoolName: string;
  subject: string;
  classGrade: string;
  timeAllowed: string;
  maxMarks: number;
  sections: SectionItem[];
  answerKey: AnswerKeyItem[];
  generatedAt: Date;
}

const QuestionItemSchema = new Schema<QuestionItem>(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    options: { type: [String] },
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard"],
      required: true,
    },
    marks: { type: Number, required: true },
    type: { type: String, required: true },
  },
  { _id: false }
);

const SectionSchema = new Schema<SectionItem>(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionItemSchema], required: true },
  },
  { _id: false }
);

const AnswerKeySchema = new Schema<AnswerKeyItem>(
  {
    questionNumber: { type: Number, required: true },
    answer: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const OutputSchema = new Schema<IOutputDocument>({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
    unique: true,
  },
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  classGrade: { type: String, required: true },
  timeAllowed: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  sections: { type: [SectionSchema], required: true },
  answerKey: { type: [AnswerKeySchema], required: true },
  generatedAt: { type: Date, default: Date.now },
});

export const Output = mongoose.model<IOutputDocument>("Output", OutputSchema);
