import { authService } from '../services/auth.service.js';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const claims = authService.verifyToken(token);
    req.user = authService.buildUserContext(claims);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const requireRole = (allowedRoles = []) => {
  const normalizedAllowed = allowedRoles.map((role) => String(role).toUpperCase());

  return (req, res, next) => {
    const role = String(req.user?.role ?? 'GUEST').toUpperCase();
    if (!normalizedAllowed.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role permissions' });
    }

    return next();
  };
};
