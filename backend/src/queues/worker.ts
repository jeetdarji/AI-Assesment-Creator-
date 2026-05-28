import dotenv from "dotenv";
dotenv.config();

import { Worker, Job } from "bullmq";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { bullmqConnection } from "../config/redis";
import { Assignment } from "../models/Assignment";
import { Output } from "../models/Output";
import { generateAssessment } from "../services/aiService";
import { buildPrompt } from "../utils/promptBuilder";
import { setOutput } from "../services/cacheService";

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const QUEUE_NAME = "assignment-generation";

interface JobData {
  assignmentId: string;
}

export async function processJob(job: Job<JobData>): Promise<void> {
  const { assignmentId } = job.data;
  console.log(`[Worker] Processing assignment ${assignmentId} (attempt ${job.attemptsMade + 1})`);

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  await Assignment.findByIdAndUpdate(assignmentId, { status: "processing" });

  try {
    let referenceContent = assignment.referenceContent;

    // Process file in the background if it hasn't been parsed yet
    if (!referenceContent && assignment.fileUrl) {
      try {
        const match = assignment.fileUrl.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          const mimeType = match[1];
          const buffer = Buffer.from(match[2], "base64");

          if (mimeType === "application/pdf") {
            const data = await pdfParse(buffer);
            referenceContent = data.text;
          } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ buffer });
            referenceContent = result.value;
          } else if (mimeType === "text/plain") {
            referenceContent = buffer.toString("utf8");
          }

          // Optional: save back to DB so we don't have to parse it again
          if (referenceContent) {
            await Assignment.findByIdAndUpdate(assignmentId, {
              $set: { referenceContent },
              $unset: { fileUrl: "" },
            });
          }
        }
      } catch (extractError) {
        console.error(`[Worker] Failed to extract text for assignment ${assignmentId}:`, extractError);
      }
    }

    const prompt = buildPrompt({
      questionTypes: assignment.questionTypes,
      totalQuestions: assignment.totalQuestions,
      totalMarks: assignment.totalMarks,
      additionalInfo: assignment.additionalInfo || undefined,
      referenceContent: referenceContent || undefined,
    });

    const generatedData = await generateAssessment(prompt);

    const output = await Output.findOneAndUpdate(
      { assignmentId: new mongoose.Types.ObjectId(assignmentId) },
      {
        assignmentId: new mongoose.Types.ObjectId(assignmentId),
        schoolName: generatedData.schoolName,
        subject: generatedData.subject,
        classGrade: generatedData.classGrade,
        timeAllowed: generatedData.timeAllowed,
        maxMarks: generatedData.maxMarks,
        sections: generatedData.sections,
        answerKey: generatedData.answerKey,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await setOutput(assignmentId, output.toObject());

    await Assignment.findByIdAndUpdate(assignmentId, { status: "completed" });

    console.log(`[Worker] Assignment ${assignmentId} completed successfully`);
  } catch (err) {
    await Assignment.findByIdAndUpdate(assignmentId, { status: "failed" });
    throw err;
  }
}

async function startWorker(): Promise<void> {
  await connectDB();

  const worker = new Worker<JobData>(QUEUE_NAME, processJob, {
    connection: bullmqConnection as any,
    skipVersionCheck: true,
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60000,
    },
  });

  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("[Worker] Worker error:", err.message);
  });

  console.log("\x1b[32m[Worker] Assignment generation worker started\x1b[0m");
}

startWorker().catch((err) => {
  console.error("[Worker] Failed to start:", err);
  process.exit(1);
});
