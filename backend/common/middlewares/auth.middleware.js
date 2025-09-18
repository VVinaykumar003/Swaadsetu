const { verifyToken } = require("../libs/jwt");
const config = require("../../config");

module.exports = function authMiddleware(req, res, next) {
  // Skip authentication for public routes
  const publicRoutes = [
    `/api/${req.params.rid}/admin/menu`,
    `/api/${req.params.rid}/tables`,
    `/api/${req.params.rid}/tables/:id`,
    `/api/${req.params.rid}/calls`,
  ];

  if (publicRoutes.some((route) => req.originalUrl.startsWith(route))) {
    return next();
  }

  // Get token from header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};
