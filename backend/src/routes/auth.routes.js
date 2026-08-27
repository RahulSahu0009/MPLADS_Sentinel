import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { asyncHandler } from '../lib/async-handler.js';
import { createHttpError } from '../lib/http-error.js';
import { loginSchema, logoutSchema, refreshSchema } from '../validators/auth.validator.js';

export const authRouter = Router();
const controller = new AuthController();

authRouter.post('/login', asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createHttpError(400, 'Invalid login payload', { issues: parsed.error.issues });
  }

  const result = await controller.login(parsed.data);
  res.json(result);
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createHttpError(400, 'Invalid refresh payload', { issues: parsed.error.issues });
  }

  const result = await controller.refreshToken(parsed.data);
  res.json(result);
}));

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const parsed = logoutSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createHttpError(400, 'Invalid logout payload', { issues: parsed.error.issues });
  }

  const result = await controller.logout(parsed.data);
  res.json(result);
}));
