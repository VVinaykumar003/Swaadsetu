/**
 * Role-based authorization middleware
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns Middleware function that authorizes based on role
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Normalize to array for easier checking
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Check if user exists and has a role
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ error: "Unauthorized - User not authenticated" });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden - Insufficient permissions" });
    }

    next();
  };
};

module.exports = requireRole;
