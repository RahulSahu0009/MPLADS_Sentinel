import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const normalizeRole = (role) => String(role ?? 'GUEST').toUpperCase();

export const authService = {
  issueToken(user, expiresIn = config.jwtExpiresIn) {
    const safeUser = {
      id: user?.id ?? user?.email ?? 'guest',
      email: user?.email ?? null,
      role: normalizeRole(user?.role),
    };

    return jwt.sign(
      {
        sub: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
        type: user?.type ?? 'access',
      },
      config.jwtSecret,
      { expiresIn }
    );
  },

  verifyToken(token) {
    if (!token || !String(token).trim()) {
      const error = new Error('Authentication token is required');
      error.status = 401;
      throw error;
    }

    return jwt.verify(token, config.jwtSecret);
  },

  buildUserContext(claims = {}) {
    return {
      id: claims.sub ?? claims.id ?? null,
      email: claims.email ?? null,
      role: normalizeRole(claims.role),
    };
  },
};
