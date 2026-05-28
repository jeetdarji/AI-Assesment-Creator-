// filepath: backend/src/socket/socketManager.ts
// description: Socket.io server lifecycle manager — init, accessor, and broadcast helper.

import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "http";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  const frontendUrl: string = process.env.FRONTEND_URL || "http://localhost:3000";

  io = new Server(httpServer, {
    cors: {
      origin: frontendUrl,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket): void => {
    console.log(`\x1b[36m[Socket] Client connected: ${socket.id}\x1b[0m`);

    socket.on("disconnect", (): void => {
      console.log(`\x1b[33m[Socket] Client disconnected: ${socket.id}\x1b[0m`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (io === null) {
    throw new Error("Socket.io not initialized. Call initSocket(httpServer) first.");
  }
  return io;
}

export function emitToAll(event: string, data: unknown): void {
  getIO().emit(event, data);
}
