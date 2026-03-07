import { z } from 'zod';
import { insertPageSchema, pages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  pages: {
    list: {
      method: 'GET' as const,
      path: '/api/pages' as const,
      responses: {
        200: z.array(z.custom<typeof pages.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/pages/:id' as const,
      responses: {
        200: z.custom<typeof pages.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/pages' as const,
      input: insertPageSchema,
      responses: {
        201: z.custom<typeof pages.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/pages/:id' as const,
      input: insertPageSchema.partial(),
      responses: {
        200: z.custom<typeof pages.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/pages/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    askAi: {
      method: 'POST' as const,
      path: '/api/pages/:id/ai' as const,
      input: z.object({ prompt: z.string(), context: z.string().optional() }),
      responses: {
        200: z.object({ text: z.string() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    duplicate: {
      method: 'POST' as const,
      path: '/api/pages/:id/duplicate' as const,
      responses: {
        201: z.custom<typeof pages.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type PageCreateInput = z.infer<typeof api.pages.create.input>;
export type PageUpdateInput = z.infer<typeof api.pages.update.input>;
