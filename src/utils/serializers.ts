import type { Project, User } from "@prisma/client";

export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export function publicProject(project: Project) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    ownerId: project.ownerId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}
