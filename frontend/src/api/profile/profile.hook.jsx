import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
} from "./profile.service";

export const profileQueryKeys = {
  all: ["profile"],
};

export const useProfile = () =>
  useQuery({ queryKey: profileQueryKeys.all, queryFn: getProfile });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKeys.all, profile);
    },
  });
};
