import type { NextRequest } from "next/server";
import type { ZodSchema } from "zod";
import { badRequest } from "./api-error";

export async function parseJson<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    throw badRequest("Invalid request body", error);
  }
}

export function requestContext(request: NextRequest) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: request.headers.get("user-agent") ?? undefined
  };
}
