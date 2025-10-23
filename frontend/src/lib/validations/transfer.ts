import * as z from 'zod';

export const TransferFormSchema = z.object({
  recipient_identifier: z
    .string()
    .min(1, 'Username or email is required')
    .regex(/^[a-zA-Z0-9@._-]+$/, 'Invalid username or email format'),
  amount: z
    .number()
    .min(100, 'Minimum transfer amount is ₦100')
    .max(1000000, 'Maximum transfer amount is ₦1,000,000'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),
});

export type TransferFormData = z.infer<typeof TransferFormSchema>;