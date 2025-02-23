import { z } from 'zod';
export const budgetSchemaZod = z.object({
  userId: z.string().min(1),
  category: z.string().min(1),
  monthlyLimit: z.number().positive(),
  month: z.string().regex(/^\d{2}-\d{4}$/, 'Invalid month format (MM-YYYY)'),
});
