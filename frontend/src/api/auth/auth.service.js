import axiosClient from "../axiosClient";
import { clearAccessToken, saveAccessToken } from "./token";
import { savePermissions } from "../../utils/permissions";

const persistAuthResponse = (response) => {
  const result = response?.data?.data ?? response?.data ?? response;
  if (result?.accessToken) saveAccessToken(result.accessToken);
  savePermissions(result?.permissions);
  return result;
};

export const login = async (credentials) => {
  const { data } = await axiosClient.post("/auth/login", credentials);
  return persistAuthResponse(data);
};

export const register = async (user) => {
  const { data } = await axiosClient.post("/auth/register", user);
  return persistAuthResponse(data);
};

export const logout = async () => {
  try {
    await axiosClient.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
};
