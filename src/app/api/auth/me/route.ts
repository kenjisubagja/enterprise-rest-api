import type { NextRequest } from "next/server";
import { prisma } from "@/config/prisma";
import { requireAuth } from "@/middlewares/auth";
import { fail, ok } from "@/utils/api-response";
import { notFound } from "@/utils/api-error";
import { publicUser } from "@/utils/serializers";

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) throw notFound("User not found");

    return ok(publicUser(user));
  } catch (error) {
    return fail(error);
  }
}
