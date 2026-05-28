import { redisClient } from "../config/redis";
import { IOutput } from "../types/output";

const CACHE_TTL = 3600; // 1 hour

export async function getOutput(assignmentId: string): Promise<IOutput | null> {
  try {
    const data = await redisClient.get(`output:${assignmentId}`);
    if (data) {
      return JSON.parse(data) as IOutput;
    }
    return null;
  } catch (err) {
    console.error("[CacheService] getOutput error:", err);
    return null;
  }
}

export async function setOutput(assignmentId: string, output: unknown): Promise<void> {
  try {
    await redisClient.set(`output:${assignmentId}`, JSON.stringify(output), "EX", CACHE_TTL);
  } catch (err) {
    console.error("[CacheService] setOutput error:", err);
  }
}

export async function deleteOutput(assignmentId: string): Promise<void> {
  try {
    await redisClient.del(`output:${assignmentId}`);
  } catch (err) {
    console.error("[CacheService] deleteOutput error:", err);
  }
}
