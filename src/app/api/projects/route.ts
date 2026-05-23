import type { NextRequest } from "next/server";
import { ProjectStatus, Role } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { requireAuth } from "@/middlewares/auth";
import { createProjectSchema } from "@/schemas/project.schema";
import { created, fail, ok } from "@/utils/api-response";
import { getPagination, paginated } from "@/utils/pagination";
import { parseJson, requestContext } from "@/utils/request";
import { publicProject } from "@/utils/serializers";
import { writeAuditLog } from "@/services/audit.service";

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip, take, search } = getPagination(searchParams);
    const rawStatus = searchParams.get("status");
    const status =
      rawStatus && Object.values(ProjectStatus).includes(rawStatus as ProjectStatus)
        ? (rawStatus as ProjectStatus)
        : undefined;

    const where = {
      ...(authUser.role === Role.USER ? { ownerId: authUser.id } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take
      }),
      prisma.project.count({ where })
    ]);

    return ok(paginated(projects.map(publicProject), total, page, limit));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const input = await parseJson(request, createProjectSchema);

    const project = await prisma.project.create({
      data: {
        ...input,
        ownerId: authUser.id
      }
    });

    await writeAuditLog({
      actorId: authUser.id,
      action: "CREATE",
      entity: "Project",
      entityId: project.id,
      metadata: input,
      ...requestContext(request)
    });

    return created(publicProject(project));
  } catch (error) {
    return fail(error);
  }
}
