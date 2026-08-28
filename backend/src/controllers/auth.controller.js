import { authService } from '../services/auth.service.js';

export class AuthController {
  async login(payload = {}) {
    const email = String(payload.email ?? '').trim();
    const password = String(payload.password ?? '');

    if (!email || !password) {
      const error = new Error('Email and password are required.');
      error.status = 401;
      throw error;
    }

    if (password.length < 8) {
      const error = new Error('Password must be at least 8 characters long.');
      error.status = 401;
      throw error;
    }

    const authenticatedUser = await authService.authenticate(email, password);

    return {
      token: authService.issueToken(authenticatedUser),
      refreshToken: authService.issueToken({ ...authenticatedUser, type: 'refresh' }, '7d'),
      user: authenticatedUser,
    };
  }

  async refreshToken(payload = {}) {
    const token = payload.refreshToken ?? payload.token;
    if (!token) {
      const error = new Error('Refresh token is required.');
      error.status = 401;
      throw error;
    }

    const claims = authService.verifyToken(token);
    if (claims.type !== 'refresh') {
      const error = new Error('Invalid refresh token.');
      error.status = 401;
      throw error;
    }

    const user = authService.buildUserContext(claims);
    return {
      token: authService.issueToken(user),
      refreshToken: authService.issueToken({ ...user, type: 'refresh' }, '7d'),
      user,
    };
  }

  async logout(_payload = {}) {
    return { ok: true, message: 'Logged out successfully.' };
  }
}
