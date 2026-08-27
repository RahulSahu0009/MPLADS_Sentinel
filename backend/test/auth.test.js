import test from 'node:test';
import assert from 'node:assert/strict';

import { authService } from '../src/services/auth.service.js';
import { requireAuth, requireRole } from '../src/middleware/auth.middleware.js';

process.env.JWT_SECRET = 'test-secret';

test('auth service issues and verifies tokens', () => {
  const token = authService.issueToken({ id: 'user-1', email: 'admin@example.com', role: 'ADMIN' });
  const decoded = authService.verifyToken(token);

  assert.equal(decoded.email, 'admin@example.com');
  assert.equal(decoded.role, 'ADMIN');
  assert.equal(authService.buildUserContext(decoded).role, 'ADMIN');
});

test('requireAuth rejects missing or invalid bearer tokens', () => {
  const req = { headers: {} };
  const res = {
    status(code) {
      return { json(payload) { return { code, payload }; } };
    },
  };

  const result = requireAuth(req, res, () => {});
  assert.deepEqual(result, { code: 401, payload: { message: 'Authentication required.' } });
});

test('requireRole blocks unauthorized users', () => {
  const req = { user: { role: 'USER' } };
  const res = {
    status(code) {
      return { json(payload) { return { code, payload }; } };
    },
  };

  const result = requireRole(['ADMIN'])(req, res, () => {});
  assert.deepEqual(result, { code: 403, payload: { message: 'Forbidden: insufficient role permissions' } });
});
