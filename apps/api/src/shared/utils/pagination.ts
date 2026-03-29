import { Request } from 'express';

export interface PaginationQuery {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export function parsePagination(req: Request, defaultPageSize = 20): PaginationQuery {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || defaultPageSize));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
