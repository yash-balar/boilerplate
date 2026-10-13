const express = require("express");
const { authenticate, requirePermission } = require("../middleware/authenticate");
const PERMISSIONS = require("../constants/permissions");
const {
  createManager,
  deleteManager,
  getManager,
  listManagers,
  listManagersCursor,
  updateManager,
} = require("../controllers/managerController");

const router = express.Router();
router.use(authenticate);
router
  .route("/cursor")
  .get(requirePermission(PERMISSIONS.MANAGERS_READ), listManagersCursor);
router.route("/")
  .get(requirePermission(PERMISSIONS.MANAGERS_READ), listManagers)
  .post(requirePermission(PERMISSIONS.MANAGERS_CREATE), createManager);
router.route("/:managerId")
  .get(requirePermission(PERMISSIONS.MANAGERS_READ), getManager)
  .put(requirePermission(PERMISSIONS.MANAGERS_UPDATE), updateManager)
  .delete(requirePermission(PERMISSIONS.MANAGERS_DELETE), deleteManager);

module.exports = router;
