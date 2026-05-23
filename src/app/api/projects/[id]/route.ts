import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { requireAuth } from "@/middlewares/auth";
import { updateProjectSchema } from "@/schemas/project.schema";
import { fail, noContent, ok } from "@/utils/api-response";
import { forbidden, notFound } from "@/utils/api-error";
import { parseJson, requestContext } from "@/utils/request";
import { publicProject } from "@/utils/serializers";
import { writeAuditLog } from "@/services/audit.service";

type Params = { params: Promise<{ id: string }> };

async function getProjectOrThrow(id: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw notFound("Project not found");
  return project;
}

function assertCanAccess(projectOwnerId: string, user: { id: string; role: Role }) {
  if (user.role === Role.ADMIN || user.role === Role.MANAGER || projectOwnerId === user.id) return;
  throw forbidden("You cannot access this project");
}

function assertCanMutate(projectOwnerId: string, user: { id: string; role: Role }) {
  if (user.role === Role.ADMIN || projectOwnerId === user.id) return;
  throw forbidden("You cannot modify this project");
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const authUser = await requireAuth(request);
    const { id } = await params;
    const project = await getProjectOrThrow(id);
    assertCanAccess(project.ownerId, authUser);
    return ok(publicProject(project));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const authUser = await requireAuth(request);
    const { id } = await params;
    const current = await getProjectOrThrow(id);
    assertCanMutate(current.ownerId, authUser);

    const input = await parseJson(request, updateProjectSchema);
    const project = await prisma.project.update({
      where: { id },
      data: input
    });

    await writeAuditLog({
      actorId: authUser.id,
      action: "UPDATE",
      entity: "Project",
      entityId: project.id,
      metadata: input,
      ...requestContext(request)
    });

    return ok(publicProject(project));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const authUser = await requireAuth(request);
    const { id } = await params;
    const current = await getProjectOrThrow(id);
    assertCanMutate(current.ownerId, authUser);

    await prisma.project.delete({ where: { id } });
    await writeAuditLog({
      actorId: authUser.id,
      action: "DELETE",
      entity: "Project",
      entityId: id,
      ...requestContext(request)
    });

    return noContent();
  } catch (error) {
    return fail(error);
  }
}
