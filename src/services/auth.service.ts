import { prisma } from "@/config/prisma";
import { conflict, unauthorized } from "@/utils/api-error";
import { signAccessToken } from "@/utils/jwt";
import { hashPassword, verifyPassword } from "@/utils/password";
import { publicUser } from "@/utils/serializers";
import type { LoginInput, RegisterInput } from "@/schemas/auth.schema";

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw conflict("Email already registered");
  }

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: await hashPassword(input.password)
    }
  });

  const accessToken = await signAccessToken(user);
  return { user: publicUser(user), accessToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user || !user.isActive) {
    throw unauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw unauthorized("Invalid email or password");
  }

  const accessToken = await signAccessToken(user);
  return { user: publicUser(user), accessToken };
}
