import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { requireRole } from "@/middlewares/auth";
import { updateUserSchema } from "@/schemas/user.schema";
import { fail, noContent, ok } from "@/utils/api-response";
import { notFound } from "@/utils/api-error";
import { parseJson, requestContext } from "@/utils/request";
import { publicUser } from "@/utils/serializers";
import { writeAuditLog } from "@/services/audit.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await requireRole(request, [Role.ADMIN]);
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw notFound("User not found");
    return ok(publicUser(user));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const actor = await requireRole(request, [Role.ADMIN]);
    const { id } = await params;
    const input = await parseJson(request, updateUserSchema);

    const user = await prisma.user.update({
      where: { id },
      data: input
    });

    await writeAuditLog({
      actorId: actor.id,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      metadata: input,
      ...requestContext(request)
    });

    return ok(publicUser(user));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const actor = await requireRole(request, [Role.ADMIN]);
    const { id } = await params;

    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });

    await writeAuditLog({
      actorId: actor.id,
      action: "DELETE",
      entity: "User",
      entityId: id,
      ...requestContext(request)
    });

    return noContent();
  } catch (error) {
    return fail(error);
  }
}
