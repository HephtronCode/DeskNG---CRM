import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Set a timeout for server selection
    });
    console.log(
      `MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`,
    );
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Exit the process with failure
  }
};
