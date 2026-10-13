const express = require("express");
const rateLimit = require("express-rate-limit");
const { authenticate, requirePermission } = require("../middleware/authenticate");
const PERMISSIONS = require("../constants/permissions");
const {
  changePassword,
  login,
  logout,
  register,
} = require("../controllers/authController");

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({
    success: false,
    message: "Too many login attempts. Please try again later.",
  }),
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/logout", authenticate, logout);
router.patch(
  "/password",
  authenticate,
  requirePermission(PERMISSIONS.PROFILE_UPDATE),
  changePassword,
);

module.exports = router;
