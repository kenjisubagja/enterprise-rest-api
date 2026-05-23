import { Role } from "@prisma/client";
import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
