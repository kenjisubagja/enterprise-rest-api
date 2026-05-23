import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional()
});

export function getPagination(searchParams: URLSearchParams) {
  const parsed = paginationSchema.parse(Object.fromEntries(searchParams));
  return {
    ...parsed,
    skip: (parsed.page - 1) * parsed.limit,
    take: parsed.limit
  };
}

export function paginated<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
