import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    openapi: "3.0.3",
    info: {
      title: "Enterprise REST API Example",
      version: "1.0.0",
      description: "An enterprise-style REST API built with Next.js, PostgreSQL, and Prisma."
    },
    servers: [{ url: "/api" }],
    security: [{ bearerAuth: [] }],
    paths: {
      "/health": {
        get: {
          tags: ["System"],
          summary: "Database and service healthcheck",
          security: [],
          responses: {
            "200": { description: "Service is healthy" }
          }
        }
      },
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" },
                example: {
                  email: "user@example.com",
                  name: "User Demo",
                  password: "Password123!"
                }
              }
            }
          },
          responses: {
            "201": { description: "User registered" },
            "409": { description: "Email already registered" }
          }
        }
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and get an access token",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" },
                example: {
                  email: "admin@example.com",
                  password: "Password123!"
                }
              }
            }
          },
          responses: {
            "200": { description: "Login success and JWT returned" },
            "401": { description: "Invalid credentials" }
          }
        }
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get the current user profile from the Bearer token",
          responses: {
            "200": { description: "Current user profile" },
            "401": { description: "Missing or invalid token" }
          }
        }
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: "List users, admin only",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
            { name: "search", in: "query", schema: { type: "string" } }
          ],
          responses: {
            "200": { description: "Paginated users" },
            "403": { description: "Admin role required" }
          }
        }
      },
      "/users/{id}": {
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        get: {
          tags: ["Users"],
          summary: "Detail user, admin only",
          responses: { "200": { description: "User detail" }, "404": { description: "Not found" } }
        },
        patch: {
          tags: ["Users"],
          summary: "Update user, admin only",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateUserRequest" },
                example: { name: "Admin Updated", role: "ADMIN", isActive: true }
              }
            }
          },
          responses: { "200": { description: "User updated" }, "404": { description: "Not found" } }
        },
        delete: {
          tags: ["Users"],
          summary: "Deactivate user, admin only",
          responses: { "204": { description: "User deactivated" } }
        }
      },
      "/projects": {
        get: {
          tags: ["Projects"],
          summary: "List projects with pagination, search, and status filtering",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { $ref: "#/components/schemas/ProjectStatus" } }
          ],
          responses: { "200": { description: "Paginated projects" } }
        },
        post: {
          tags: ["Projects"],
          summary: "Create project",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateProjectRequest" },
                example: {
                  name: "Billing Service",
                  description: "Internal billing API",
                  status: "ACTIVE"
                }
              }
            }
          },
          responses: { "201": { description: "Project created" } }
        }
      },
      "/projects/{id}": {
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        get: {
          tags: ["Projects"],
          summary: "Detail project",
          responses: { "200": { description: "Project detail" }, "404": { description: "Not found" } }
        },
        patch: {
          tags: ["Projects"],
          summary: "Update project",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateProjectRequest" },
                example: {
                  name: "Billing Service v2",
                  description: "Updated internal billing API",
                  status: "DONE"
                }
              }
            }
          },
          responses: { "200": { description: "Project updated" }, "404": { description: "Not found" } }
        },
        delete: {
          tags: ["Projects"],
          summary: "Delete project",
          responses: { "204": { description: "Project deleted" } }
        }
      },
      "/audit-logs": {
        get: {
          tags: ["Audit Logs"],
          summary: "List audit logs, admin/manager only",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } }
          ],
          responses: { "200": { description: "Paginated audit logs" } }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["email", "name", "password"],
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string", minLength: 2 },
            password: { type: "string", minLength: 8 }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" }
          }
        },
        Role: {
          type: "string",
          enum: ["ADMIN", "MANAGER", "USER"]
        },
        ProjectStatus: {
          type: "string",
          enum: ["PLANNING", "ACTIVE", "ON_HOLD", "DONE", "ARCHIVED"]
        },
        UpdateUserRequest: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 2 },
            role: { $ref: "#/components/schemas/Role" },
            isActive: { type: "boolean" }
          }
        },
        CreateProjectRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 3 },
            description: { type: "string" },
            status: { $ref: "#/components/schemas/ProjectStatus" }
          }
        },
        UpdateProjectRequest: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 3 },
            description: { type: "string" },
            status: { $ref: "#/components/schemas/ProjectStatus" }
          }
        }
      }
    }
  });
}
