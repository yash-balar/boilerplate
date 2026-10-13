import { useMutation } from "@tanstack/react-query";
import { login, logout, register } from "./auth.service";

export const useLogin = (options) => useMutation({ mutationFn: login, ...options });

export const useRegister = (options) =>
  useMutation({ mutationFn: register, ...options });

export const useLogout = (options) =>
  useMutation({ mutationFn: logout, ...options });
