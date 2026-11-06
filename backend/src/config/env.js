import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT must be at least 32 characters long"),
  JWT_EXPIRE: z.string().default("7d"),
  // Comma-separated list of allowed browser origins.
  CORS_ORIGIN: z
    .string()
    .transform((value) =>
      value.split(",").map((origin) => origin.trim()),
    )
    .default("http://localhost:5173"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
