import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("15m"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  SHOW_RESET_TOKEN_IN_RESPONSE: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
  APP_BASE_URL: process.env.APP_BASE_URL,
  SHOW_RESET_TOKEN_IN_RESPONSE: process.env.SHOW_RESET_TOKEN_IN_RESPONSE
});
