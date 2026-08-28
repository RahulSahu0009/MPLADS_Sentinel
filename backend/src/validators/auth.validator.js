import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('A valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token is required.'),
}).passthrough();

export const logoutSchema = z.object({
  token: z.string().optional(),
  refreshToken: z.string().optional(),
}).passthrough();
