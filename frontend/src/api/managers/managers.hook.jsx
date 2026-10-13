import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createManager,
  deleteManager,
  getManager,
  getManagers,
  updateManager,
} from "./managers.service";

export const managerQueryKeys = {
  all: ["managers"],
  list: (params) => ["managers", "list", params],
  detail: (managerId) => ["managers", managerId],
};

export const useManagers = (params) =>
  useInfiniteQuery({
    queryKey: managerQueryKeys.list(params),
    queryFn: ({ pageParam }) => getManagers({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

export const useManager = (managerId) =>
  useQuery({
    queryKey: managerQueryKeys.detail(managerId),
    queryFn: () => getManager(managerId),
    enabled: Boolean(managerId),
  });

export const useCreateManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createManager,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: managerQueryKeys.all }),
  });
};

export const useUpdateManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateManager,
    onSuccess: (manager) => {
      queryClient.setQueryData(managerQueryKeys.detail(manager.id), manager);
      return queryClient.invalidateQueries({ queryKey: managerQueryKeys.all });
    },
  });
};

export const useDeleteManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteManager,
    onSuccess: (_result, managerId) => {
      queryClient.removeQueries({ queryKey: managerQueryKeys.detail(managerId) });
      return queryClient.invalidateQueries({ queryKey: managerQueryKeys.all });
    },
  });
};
