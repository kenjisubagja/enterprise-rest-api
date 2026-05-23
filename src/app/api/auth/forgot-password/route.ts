import type { NextRequest } from "next/server";
import { forgotPassword } from "@/services/auth.service";
import { writeAuditLog } from "@/services/audit.service";
import { forgotPasswordSchema } from "@/schemas/auth.schema";
import { fail, ok } from "@/utils/api-response";
import { parseJson, requestContext } from "@/utils/request";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, forgotPasswordSchema);
    const result = await forgotPassword(input);

    if (result.auditUserId) {
      await writeAuditLog({
        actorId: result.auditUserId,
        action: "PASSWORD_RESET_REQUEST",
        entity: "User",
        entityId: result.auditUserId,
        ...requestContext(request)
      });
    }

    return ok(result.response);
  } catch (error) {
    return fail(error);
  }
}
