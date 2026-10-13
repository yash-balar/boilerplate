import axiosClient from "../axiosClient";
import { fallbackToDemo } from "../demoFallback";
import {
  addDummyManager,
  editDummyManager,
  getDummyManager,
  getDummyManagerPage,
  removeDummyManager,
} from "../../utils/dummyManagerData";

const normalizeManagerPage = (response, request) => {
  let payload = response;
  while (payload && !Array.isArray(payload) && payload.data && !Array.isArray(payload.data)) {
    payload = payload.data;
  }

  const items = Array.isArray(payload)
    ? payload
    : payload?.items ?? payload?.managers ?? payload?.results ?? payload?.data;
  if (!Array.isArray(items)) {
    throw new Error("The managers API returned an invalid page.");
  }

  const metadata = payload.meta ?? payload.pagination ?? payload;
  const page = Number(
    metadata.page
      ?? metadata.pageNumber
      ?? metadata.page_number
      ?? metadata.currentPage
      ?? metadata.current_page
      ?? request.page,
  );
  const pageSize = Number(
    metadata.pageSize
      ?? metadata.page_size
      ?? metadata.per_page
      ?? metadata.limit
      ?? request.limit
      ?? request.pageSize,
  );
  const total = Number(
    metadata.total
      ?? metadata.totalItems
      ?? metadata.total_items
      ?? metadata.totalCount
      ?? metadata.total_count
      ?? items.length,
  );
  const totalPages = Number(
    metadata.totalPages
      ?? metadata.total_pages
      ?? metadata.pageCount
      ?? metadata.last_page
      ?? Math.max(1, Math.ceil(total / pageSize)),
  );

  return { items, total, page, pageSize, totalPages };
};

const unwrapManager = (response) =>
  response?.data?.manager
  ?? response?.data
  ?? response?.manager
  ?? response;

export const getManagers = async (params) => {
  const { page, pageSize, limit, search, status, ...filters } = params;
  const requestLimit = limit ?? pageSize;
  const queryParams = {
    page,
    limit: requestLimit,
  };
  const normalizedSearch = search?.trim();
  if (normalizedSearch) queryParams.search = normalizedSearch;

  Object.entries({ ...filters, status }).forEach(([key, value]) => {
    if (
      value !== undefined
      && value !== null
      && value !== ""
      && value !== "all"
    ) {
      queryParams[key] = value;
    }
  });

  const fallbackParams = {
    ...params,
    pageSize: requestLimit,
    limit: requestLimit,
    search: normalizedSearch ?? "",
    status: status ?? "all",
  };
  let response;
  try {
    ({ data: response } = await axiosClient.get("/managers", {
      params: queryParams,
    }));
  } catch (error) {
    fallbackToDemo("Managers", error);
    return getDummyManagerPage(fallbackParams);
  }
  return normalizeManagerPage(response, fallbackParams);
};

export const getManager = async (managerId) => {
  try {
    const { data } = await axiosClient.get(`/managers/${managerId}`);
    return unwrapManager(data);
  } catch (error) {
    fallbackToDemo("Manager details", error);
    return getDummyManager(managerId);
  }
};

export const createManager = async (manager) => {
  try {
    const { data } = await axiosClient.post("/managers", manager);
    return unwrapManager(data);
  } catch (error) {
    fallbackToDemo("Create manager", error);
    return addDummyManager(manager);
  }
};

export const updateManager = async (manager) => {
  try {
    const { id, ...payload } = manager;
    const { data } = await axiosClient.put(`/managers/${id}`, payload);
    return unwrapManager(data);
  } catch (error) {
    fallbackToDemo("Update manager", error);
    return editDummyManager(manager);
  }
};

export const deleteManager = async (managerId) => {
  try {
    await axiosClient.delete(`/managers/${managerId}`);
  } catch (error) {
    fallbackToDemo("Delete manager", error);
    return removeDummyManager(managerId);
  }
};
