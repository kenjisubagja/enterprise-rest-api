import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { requireRole } from "@/middlewares/auth";
import { fail, ok } from "@/utils/api-response";
import { getPagination, paginated } from "@/utils/pagination";
import { publicUser } from "@/utils/serializers";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [Role.ADMIN]);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip, take, search } = getPagination(searchParams);
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      prisma.user.count({ where })
    ]);

    return ok(paginated(users.map(publicUser), total, page, limit));
  } catch (error) {
    return fail(error);
  }
}
