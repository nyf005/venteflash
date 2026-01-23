import { z } from "zod";

const envSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]).default("development")
});

export const env = envSchema.parse({
  nodeEnv: process.env.NODE_ENV
});
