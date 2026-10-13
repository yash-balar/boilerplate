import { clearPermissions } from "../../utils/permissions";

export const ACCESS_TOKEN_KEY = "workspace_access_token";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const saveAccessToken = (token) => {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  clearPermissions();
};
