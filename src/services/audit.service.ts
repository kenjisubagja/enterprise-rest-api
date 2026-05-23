import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";

type AuditInput = {
  actorId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: unknown;
  ipAddress?: string;
  userAgent?: string;
};

export async function writeAuditLog(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metadata:
        input.metadata === undefined ? undefined : (input.metadata as Prisma.InputJsonValue),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    }
  });
}
