import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash,
      role: Role.ADMIN
    }
  });

  await prisma.project.upsert({
    where: { id: "seed-project" },
    update: {},
    create: {
      id: "seed-project",
      name: "Internal Platform",
      description: "Seed project for the enterprise REST API demo.",
      status: "ACTIVE",
      ownerId: admin.id
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
