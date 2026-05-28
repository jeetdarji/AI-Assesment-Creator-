// filepath: frontend/lib/socket.ts
// description: Socket.io client singleton — one WebSocket connection per browser session.

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket || socket.disconnected) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", (): void => {
      console.log(`[Socket] Connected: ${socket?.id}`);
    });

    socket.on("disconnect", (): void => {
      console.log("[Socket] Disconnected");
    });

    socket.on("connect_error", (err: Error): void => {
      console.error("[Socket] Connection error:", err.message);
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}

export default getSocket;
