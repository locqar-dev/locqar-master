export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function success<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return { success: true, data, meta };
}

export function paginated<T>(
  data: T,
  total: number,
  page: number,
  pageSize: number
): ApiResponse<T> {
  const totalPages = Math.ceil(total / pageSize);
  return {
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function errorResponse(message: string, code?: string): ApiResponse {
  return { success: false, error: message, code };
}
