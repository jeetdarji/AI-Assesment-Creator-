// filepath: backend/src/index.ts
// description: Express + Socket.io entrypoint. Loads env, connects DB/Redis, starts HTTP server.

import dotenv from "dotenv";
dotenv.config();

import express, { Application, NextFunction, Request, Response } from "express";
import http from "http";
import cors from "cors";

import { connectDB } from "./config/db";
import { redisClient } from "./config/redis";
import { initSocket } from "./socket/socketManager";
import assignmentRoutes from "./routes/assignments";

const PORT: number = Number(process.env.PORT) || 5000;
const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:3000";

async function bootstrap(): Promise<void> {
  await connectDB();

  // Touch redisClient so the singleton is initialized at boot.
  void redisClient;

  const app: Application = express();
  const server: http.Server = http.createServer(app);

  app.use(
    cors({
      origin: FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  initSocket(server);

  app.get("/health", (_req: Request, res: Response): void => {
    res.status(200).json({
      status: "ok",
      message: "VedaAI API is running",
      timestamp: new Date(),
    });
  });

  app.use("/api/assignments", assignmentRoutes);

  app.use((_req: Request, res: Response): void => {
    res.status(404).json({ status: "error", message: "Route not found" });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error("\x1b[31m[Server] Unhandled error:\x1b[0m", err);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  });

  server.listen(PORT, (): void => {
    console.log(`\x1b[32m[Server] Running on port ${PORT}\x1b[0m`);
  });
}

bootstrap().catch((error: unknown): void => {
  console.error("\x1b[31m[Server] Bootstrap failed:\x1b[0m", error);
  process.exit(1);
});
