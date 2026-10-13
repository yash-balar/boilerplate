const jwt = require("jsonwebtoken");
const User = require("../models/User");
const rolePermissions = require("../constants/rolePermissions");

const authenticate = async (req, res, next) => {
  const authorization = req.get("authorization") || "";
  const [scheme, token, extra] = authorization.split(" ");
  if (scheme !== "Bearer" || !token || extra) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Authentication token is invalid or expired. Please log in again.",
    });
  }

  try {
    const user = await User.findById(decoded.id).select("+token +tokenExpiresAt");
    if (!user || user.token !== token || !user.tokenExpiresAt || user.tokenExpiresAt <= new Date()) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }
    req.user = user;
    req.permissions = rolePermissions[user.role] || [];
    next();
  } catch (error) {
    next(error);
  }
};

const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.permissions?.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};

module.exports = { authenticate, requirePermission };
