const ROLES = require("./roles");
const PERMISSIONS = require("./permissions");

const rolePermissions = Object.freeze({
  [ROLES.ADMIN]: Object.freeze(Object.values(PERMISSIONS)),
  [ROLES.MANAGER]: Object.freeze([
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.MANAGERS_READ,
    PERMISSIONS.MANAGERS_CREATE,
  ]),
  [ROLES.EMPLOYEE]: Object.freeze([
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
  ]),
});

module.exports = rolePermissions;
