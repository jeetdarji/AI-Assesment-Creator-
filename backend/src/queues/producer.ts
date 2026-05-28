import { Queue } from "bullmq";
import { bullmqConnection } from "../config/redis";

const QUEUE_NAME = "assignment-generation";

export const assignmentQueue = new Queue(QUEUE_NAME, {
  connection: bullmqConnection as any,
  skipVersionCheck: true,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

interface JobPayload {
  assignmentId: string;
}

export async function enqueueAssignment(assignmentId: string): Promise<string> {
  const job = await assignmentQueue.add(
    "generate",
    { assignmentId } as JobPayload,
    { jobId: `gen-${assignmentId}` }
  );
  console.log(`[Queue] Job ${job.id} enqueued for assignment ${assignmentId}`);
  return job.id!;
}
