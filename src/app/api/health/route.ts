import { prisma } from "@/config/prisma";
import { fail, ok } from "@/utils/api-response";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return fail(error);
  }
}
