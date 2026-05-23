import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { requireRole } from "@/middlewares/auth";
import { fail, ok } from "@/utils/api-response";
import { getPagination, paginated } from "@/utils/pagination";

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, [Role.ADMIN, Role.MANAGER]);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip, take } = getPagination(searchParams);

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { actor: { select: { id: true, email: true, name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      prisma.auditLog.count()
    ]);

    return ok(paginated(items, total, page, limit));
  } catch (error) {
    return fail(error);
  }
}
