import { z } from 'zod';
export const transactionSchemaZod = z.object({
    amount: z.number().positive(),
    date: z.string().transform((str) => new Date(str)),
    description: z.string().min(1),
    category: z.string().optional(),
  });
  