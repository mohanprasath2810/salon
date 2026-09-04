// Usage in a route file:
//   router.post('/salons', authenticate, requireRole('SALON_OWNER', 'ADMIN'), createSalon);
//
// This must run AFTER authenticate (needs req.user to already exist).
// It's a "middleware factory" — requireRole(...) returns the actual
// middleware function, which is why it's called with () in routes.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      // Should never happen if authenticate() ran first, but fail safe.
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
}

module.exports = requireRole;
