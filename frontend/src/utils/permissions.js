const PERMISSIONS_KEY = "workspace_permissions";

export const PERMISSIONS = Object.freeze({
  DASHBOARD_READ: "dashboard:read",
  PROFILE_READ: "profile:read",
  PROFILE_UPDATE: "profile:update",
  MANAGERS_READ: "managers:read",
  MANAGERS_CREATE: "managers:create",
  MANAGERS_UPDATE: "managers:update",
  MANAGERS_DELETE: "managers:delete",
});

export const getPermissions = () => {
  try {
    const permissions = JSON.parse(localStorage.getItem(PERMISSIONS_KEY) || "[]");
    return Array.isArray(permissions) ? permissions : [];
  } catch {
    return [];
  }
};

export const savePermissions = (permissions) => {
  localStorage.setItem(
    PERMISSIONS_KEY,
    JSON.stringify(Array.isArray(permissions) ? permissions : []),
  );
};

export const hasPermission = (permission) => getPermissions().includes(permission);

export const clearPermissions = () => localStorage.removeItem(PERMISSIONS_KEY);
