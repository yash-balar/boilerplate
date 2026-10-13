const express = require("express");
const { authenticate, requirePermission } = require("../middleware/authenticate");
const PERMISSIONS = require("../constants/permissions");
const { getProfile, updateProfile } = require("../controllers/profileController");
const { uploadAvatar } = require("../middleware/uploadAvatar");

const router = express.Router();
router.use(authenticate);
router.get("/", requirePermission(PERMISSIONS.PROFILE_READ), getProfile);
router.patch("/", requirePermission(PERMISSIONS.PROFILE_UPDATE), uploadAvatar, updateProfile);

module.exports = router;
