import mongoose, { Schema, Document } from "mongoose";
import { QuestionTypeEntry, AssignmentStatus, IAssignment } from "../types/assignment";

export interface IAssignmentDocument extends Omit<IAssignment, "_id">, Document {}

const QuestionTypeSchema = new Schema<QuestionTypeEntry>(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignmentDocument>(
  {
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"] as AssignmentStatus[],
      default: "pending",
    },
    assignmentName: { type: String },
    dueDate: { type: Date },
    fileUrl: { type: String },
    fileName: { type: String },
    referenceContent: { type: String },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    additionalInfo: { type: String, maxlength: 1000 },
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignmentDocument>("Assignment", AssignmentSchema);
