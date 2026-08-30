import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UserRepository } from '../repositories/user.repository.js';
import { verifyPassword } from '../lib/crypto.js';

const normalizeRole = (role) => String(role ?? 'GUEST').toUpperCase();
const userRepository = new UserRepository();

export const authService = {
  async authenticate(email, password) {
    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.status = 401;
      throw error;
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.status = 401;
      throw error;
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      const error = new Error('Invalid email or password.');
      error.status = 401;
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      role: normalizeRole(user.role?.name),
    };
  },

  issueToken(user, expiresIn = config.jwtExpiresIn) {
    const safeUser = {
      id: user?.id ?? user?.email ?? 'guest',
      email: user?.email ?? null,
      role: normalizeRole(itemRole(user)),
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

function itemRole(user) {
  if (typeof user?.role === 'object') {
    return user.role?.name;
  }
  return user?.role;
}
