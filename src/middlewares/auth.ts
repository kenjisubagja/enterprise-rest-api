import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";
import { verifyAccessToken } from "@/utils/jwt";
import { forbidden, unauthorized } from "@/utils/api-error";

export async function requireAuth(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw unauthorized("Missing bearer token");
  }

  return verifyAccessToken(authorization.slice("Bearer ".length));
}

export async function requireRole(request: NextRequest, roles: Role[]) {
  const user = await requireAuth(request);
  if (!roles.includes(user.role)) {
    throw forbidden("Insufficient role");
  }

  return user;
}
