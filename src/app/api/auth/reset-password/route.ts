import type { NextRequest } from "next/server";
import { resetPassword } from "@/services/auth.service";
import { writeAuditLog } from "@/services/audit.service";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { fail, ok } from "@/utils/api-response";
import { parseJson, requestContext } from "@/utils/request";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, resetPasswordSchema);
    const result = await resetPassword(input);

    await writeAuditLog({
      actorId: result.auditUserId,
      action: "PASSWORD_RESET",
      entity: "User",
      entityId: result.auditUserId,
      ...requestContext(request)
    });

    return ok(result.response);
  } catch (error) {
    return fail(error);
  }
}
