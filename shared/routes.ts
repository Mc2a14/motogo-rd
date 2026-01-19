import { z } from 'zod';
import { insertOrderSchema, orders, users, ratings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.internal, // Not logged in
      },
    }
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id',
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: insertOrderSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/orders/:id',
      input: insertOrderSchema.partial().extend({
        status: z.enum(["pending", "accepted", "in_progress", "completed", "cancelled"]).optional(),
        driverId: z.string().optional() // Match schema (varchar)
      }),
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  drivers: {
    list: {
      method: 'GET' as const,
      path: '/api/drivers',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    }
  },
  ratings: {
    create: {
      method: 'POST' as const,
      path: '/api/ratings',
      input: z.object({
        orderId: z.number(),
        driverId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof ratings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    getByDriver: {
      method: 'GET' as const,
      path: '/api/ratings/driver/:driverId',
      responses: {
        200: z.array(z.custom<typeof ratings.$inferSelect>()),
      },
    },
    getByOrder: {
      method: 'GET' as const,
      path: '/api/ratings/order/:orderId',
      responses: {
        200: z.custom<typeof ratings.$inferSelect>().nullable(),
        404: errorSchemas.notFound,
      },
    },
  }
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

// Type exports for client-side usage
export type CreateOrderRequest = z.infer<typeof api.orders.create.input>;
export type UpdateOrderRequest = z.infer<typeof api.orders.update.input>;
