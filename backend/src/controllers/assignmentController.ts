import { Request, Response } from "express";
import mongoose from "mongoose";
import { Assignment } from "../models/Assignment";
import { Output } from "../models/Output";
import { enqueueAssignment } from "../queues/producer";
import { getOutput, deleteOutput } from "../services/cacheService";
import { QuestionTypeEntry } from "../types/assignment";

// No file processing requires here, moved to worker

export async function createAssignment(req: Request, res: Response): Promise<void> {
  try {
    const { assignmentName, questionTypes, dueDate, additionalInfo } = req.body as {
      assignmentName?: string;
      questionTypes: QuestionTypeEntry[];
      dueDate?: string;
      additionalInfo?: string;
    };

    const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0);
    const totalMarks = questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

    const file = req.file;
    const fileUrl = file ? `data:${file.mimetype};base64,${file.buffer.toString("base64")}` : undefined;
    const fileName = file ? file.originalname : undefined;
    
    let referenceContent: string | undefined = undefined;

    // File parsing is now handled asynchronously by the background worker
    // to prevent blocking the API request and causing a delay.

    const assignment = await Assignment.create({
      assignmentName,
      questionTypes,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      additionalInfo,
      fileUrl,
      fileName,
      referenceContent,
      totalQuestions,
      totalMarks,
      status: "pending",
    });

    await enqueueAssignment(assignment._id.toString());

    res.status(201).json({
      message: "Assignment created and queued for generation",
      assignment: {
        _id: assignment._id,
        status: assignment.status,
        totalQuestions,
        totalMarks,
        createdAt: assignment.createdAt,
      },
    });
  } catch (err) {
    console.error("[Controller] createAssignment error:", err);
    res.status(500).json({ error: "Failed to create assignment" });
  }
}

export async function getAllAssignments(_req: Request, res: Response): Promise<void> {
  try {
    const assignments = await Assignment.find()
      .select("-fileUrl")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ assignments });
  } catch (err) {
    console.error("[Controller] getAllAssignments error:", err);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
}

export async function getAssignmentById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid assignment id" });
      return;
    }

    const assignment = await Assignment.findById(id).select("-fileUrl").lean();
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    res.status(200).json({ assignment });
  } catch (err) {
    console.error("[Controller] getAssignmentById error:", err);
    res.status(500).json({ error: "Failed to fetch assignment" });
  }
}

export async function getAssignmentOutput(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid assignment id" });
      return;
    }

    const cached = await getOutput(id);
    if (cached) {
      res.status(200).json({ output: cached, source: "cache" });
      return;
    }

    const output = await Output.findOne({ assignmentId: id }).lean();
    if (!output) {
      res.status(404).json({ error: "Output not found. Generation may still be in progress." });
      return;
    }

    res.status(200).json({ output, source: "db" });
  } catch (err) {
    console.error("[Controller] getAssignmentOutput error:", err);
    res.status(500).json({ error: "Failed to fetch output" });
  }
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid assignment id" });
      return;
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    await Output.deleteOne({ assignmentId: id });
    await deleteOutput(id);
    await Assignment.findByIdAndDelete(id);

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error("[Controller] deleteAssignment error:", err);
    res.status(500).json({ error: "Failed to delete assignment" });
  }
}

export async function retryAssignment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid assignment id" });
      return;
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }

    if (assignment.status === "pending" || assignment.status === "processing") {
      res.status(400).json({ error: "Assignment generation is already in progress" });
      return;
    }

    await Output.deleteOne({ assignmentId: id });
    await Assignment.findByIdAndUpdate(id, { status: "pending" });
    await deleteOutput(id);
    await enqueueAssignment(id);

    res.status(200).json({ message: "Assignment re-queued for generation" });
  } catch (err) {
    console.error("[Controller] retryAssignment error:", err);
    res.status(500).json({ error: "Failed to retry assignment" });
  }
}
