import type { NextRequest } from "next/server";
import { login } from "@/services/auth.service";
import { loginSchema } from "@/schemas/auth.schema";
import { fail, ok } from "@/utils/api-response";
import { parseJson, requestContext } from "@/utils/request";
import { writeAuditLog } from "@/services/audit.service";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, loginSchema);
    const result = await login(input);

    await writeAuditLog({
      actorId: result.user.id,
      action: "LOGIN",
      entity: "User",
      entityId: result.user.id,
      ...requestContext(request)
    });

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
