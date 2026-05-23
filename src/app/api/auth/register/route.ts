import type { NextRequest } from "next/server";
import { register } from "@/services/auth.service";
import { registerSchema } from "@/schemas/auth.schema";
import { created, fail } from "@/utils/api-response";
import { parseJson, requestContext } from "@/utils/request";
import { writeAuditLog } from "@/services/audit.service";

export async function POST(request: NextRequest) {
  try {
    const input = await parseJson(request, registerSchema);
    const result = await register(input);

    await writeAuditLog({
      actorId: result.user.id,
      action: "CREATE",
      entity: "User",
      entityId: result.user.id,
      ...requestContext(request)
    });

    return created(result);
  } catch (error) {
    return fail(error);
  }
}
