// filepath: backend/src/config/db.ts
// description: MongoDB connection helper using Mongoose.

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB(): Promise<void> {
  const uri: string = process.env.MONGODB_URI || "";

  if (!uri) {
    console.error("\x1b[31m[MongoDB] MONGODB_URI is not defined in environment.\x1b[0m");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`\x1b[32m[MongoDB] Connected: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.error("\x1b[31m[MongoDB] Connection error:\x1b[0m", error);
    process.exit(1);
  }
}
