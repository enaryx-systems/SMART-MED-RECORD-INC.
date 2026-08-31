export interface PageQuery {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortDir?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 15;

export function parsePagination(query: PageQuery) {
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(
      1,
      Number.parseInt(query.pageSize ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE,
    ),
  );
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function parseSort<Column extends string>(
  query: PageQuery,
  allowed: readonly Column[],
  fallback: Column,
): { column: Column; dir: "asc" | "desc" } {
  const column = allowed.includes(query.sortBy as Column) ? (query.sortBy as Column) : fallback;
  const dir = query.sortDir === "asc" ? "asc" : "desc";
  return { column, dir };
}
