import { createHash, randomBytes } from "node:crypto";
import { env } from "@/config/env";
import { prisma } from "@/config/prisma";
import { badRequest, conflict, unauthorized } from "@/utils/api-error";
import { signAccessToken } from "@/utils/jwt";
import { hashPassword, verifyPassword } from "@/utils/password";
import { publicUser } from "@/utils/serializers";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput
} from "@/schemas/auth.schema";

const RESET_TOKEN_TTL_MINUTES = 30;
const RESET_REQUEST_MESSAGE =
  "If an active account exists for that email, a password reset link has been generated.";
const RESET_SUCCESS_MESSAGE = "Password has been reset successfully.";

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

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

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  const response: {
    message: string;
    resetToken?: string;
    resetUrl?: string;
    expiresAt?: string;
  } = { message: RESET_REQUEST_MESSAGE };

  if (!user || !user.isActive) {
    return { response };
  }

  const now = new Date();
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: now }
    },
    data: { usedAt: now }
  });

  const resetToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashResetToken(resetToken),
      userId: user.id,
      expiresAt
    }
  });

  if (env.SHOW_RESET_TOKEN_IN_RESPONSE) {
    response.resetToken = resetToken;
    response.resetUrl = `${env.APP_BASE_URL}/reset-password?token=${resetToken}`;
    response.expiresAt = expiresAt.toISOString();
  }

  return { response, auditUserId: user.id };
}

export async function resetPassword(input: ResetPasswordInput) {
  const now = new Date();
  const tokenHash = hashResetToken(input.token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!record || record.usedAt || record.expiresAt <= now || !record.user.isActive) {
    throw badRequest("Invalid or expired reset token");
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: now }
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: record.userId,
        usedAt: null,
        id: { not: record.id }
      },
      data: { usedAt: now }
    })
  ]);

  return { response: { message: RESET_SUCCESS_MESSAGE }, auditUserId: record.userId };
}
