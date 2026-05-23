import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import { env } from "@/config/env";
import type { AuthUser } from "@/types/auth";
import { unauthorized } from "./api-error";

const secret = new TextEncoder().encode(env.JWT_SECRET);

function expiresInToSeconds(value: string) {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 900;

  const amount = Number(match[1]);
  const unit = match[2];
  if (unit === "s") return amount;
  if (unit === "m") return amount * 60;
  if (unit === "h") return amount * 60 * 60;
  return amount * 24 * 60 * 60;
}

export async function signAccessToken(user: AuthUser) {
  return new SignJWT({
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInToSeconds(env.JWT_EXPIRES_IN))
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AuthUser> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub || !payload.email || !payload.role) {
      throw unauthorized("Invalid token claims");
    }

    return {
      id: payload.sub,
      email: String(payload.email),
      role: payload.role as Role
    };
  } catch {
    throw unauthorized("Invalid or expired token");
  }
}
