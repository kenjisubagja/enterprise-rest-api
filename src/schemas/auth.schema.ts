import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
