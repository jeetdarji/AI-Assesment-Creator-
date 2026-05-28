// filepath: frontend/hooks/useSocket.ts
// description: Hook to access the Socket.io singleton — ensures connection on mount.

"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

export function useSocket(): Socket {
  const [socket] = useState<Socket>(() => getSocket());

  useEffect(() => {
    // Ensure the socket is connected on mount
    if (!socket.connected) {
      socket.connect();
    }
    // Do NOT disconnect on unmount — singleton stays alive
  }, [socket]);

  return socket;
}

export default useSocket;
