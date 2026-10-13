# Manager cursor pagination: change guide

The working frontend remains page-based. This file is a reference showing what
to replace if you decide to switch it to cursor pagination. The backend endpoint
already exists at `GET /api/managers/cursor`.

The endpoint accepts `limit`, `cursor`, `search`, `status`, and `department`.
It returns:

```json
{
  "items": [],
  "limit": 10,
  "hasMore": true,
  "nextCursor": "opaque-cursor"
}
```

`nextCursor` is `null` when there are no more results. The endpoint always sorts
newest-first and does not return a total count or support arbitrary sorting.

## 1. `src/api/managers/managers.service.js`

### Replace `normalizeManagerPage`

Replace the existing `normalizeManagerPage(response, request)` function with:

```js
const normalizeManagerPage = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (!Array.isArray(payload?.items)) {
    throw new Error("The managers API returned an invalid page.");
  }

  return {
    items: payload.items,
    hasMore: Boolean(payload.hasMore),
    nextCursor: payload.nextCursor ?? null,
  };
};
```

### Replace `getManagers`

Replace the existing `getManagers` function with:

```js
export const getManagers = async (params) => {
  const { cursor, limit, search, status } = params;
  const queryParams = { limit };
  const normalizedSearch = search?.trim();
  if (normalizedSearch) queryParams.search = normalizedSearch;
  if (status && status !== "all") queryParams.status = status;

  // Demo data uses page numbers, so keep its cursor separate from API cursors.
  const demoCursor = cursor?.startsWith("demo:");
  if (!demoCursor) {
    if (cursor) queryParams.cursor = cursor;
    try {
      const { data } = await axiosClient.get("/managers/cursor", {
        params: queryParams,
      });
      return normalizeManagerPage(data);
    } catch (error) {
      fallbackToDemo("Managers", error);
    }
  }

  const page = demoCursor ? Number(cursor.slice("demo:".length)) : 1;
  const result = getDummyManagerPage({
    page,
    pageSize: limit,
    search: normalizedSearch ?? "",
    status: status ?? "all",
  });

  return {
    items: result.items,
    hasMore: result.page < result.totalPages,
    nextCursor:
      result.page < result.totalPages ? `demo:${result.page + 1}` : null,
  };
};
```

Keep the existing `getDummyManagerPage` import because it is used by the demo
fallback. The existing axios client already adds `/api` to `/managers/cursor`.

## 2. `src/api/managers/managers.hook.jsx`

In `useManagers`, replace the page-number query options:

```js
queryFn: ({ pageParam }) => getManagers({ ...params, page: pageParam }),
initialPageParam: 1,
getNextPageParam: (lastPage) =>
  lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
```

with cursor query options:

```js
queryFn: ({ pageParam }) => getManagers({ ...params, cursor: pageParam }),
initialPageParam: null,
getNextPageParam: (lastPage) =>
  lastPage.hasMore ? lastPage.nextCursor : undefined,
```

## 3. `src/pages/manager/Managers.jsx`

Keep the existing search, status filter, and `useManagers` query. Make these
page-state changes:

- Remove `sortBy` and `sortOrder` state, their change handlers, and sort values
  from the `useManagers` arguments.
- Remove `sortByOptions`, the sort controls passed to `FilterDropdown`, and
  `sortKey`, `sortBy`, `sortOrder`, and `onSort` from the `DataTable`.
  Cursor results are newest-first; the existing cursor endpoint cannot honor
  the arbitrary sort controls.
- Replace the block that calculates `loadedPages`, `total`, `pageCount`,
  `currentPage`, and `visibleManagers` with:

```js
const loadedPages = data?.pages ?? [];
const pageCount = loadedPages.length;
const currentPage = Math.min(page, Math.max(pageCount, 1));
const visibleManagers = loadedPages[currentPage - 1]?.items ?? [];
const loadedManagerCount = loadedPages.reduce(
  (count, managerPage) => count + managerPage.items.length,
  0,
);
```

- Replace `handlePageChange` with:

```js
const handlePageChange = (nextPage) => {
  if (nextPage < 1 || nextPage > pageCount + 1) return;
  if (nextPage <= pageCount) {
    setPage(nextPage);
    return;
  }

  if (hasNextPage && !isFetchingNextPage) {
    fetchNextPage().then(({ data: nextData }) => {
      if (nextData?.pages.length >= nextPage) {
        setPage(nextPage);
      }
    });
  }
};
```

  Add `hasNextPage` to the values returned by `useManagers`.
- Reset `page` to `1` in the existing search and status handlers. Keep the
  already-loaded pages so Previous can show a page without another request.
- Replace the directory total label with the loaded count, for example:

```jsx
{loadedManagerCount} {loadedManagerCount === 1 ? "person" : "people"} loaded
```

- Replace the existing `Pagination` props that use `total` and `pageSize` with
  cursor-compatible props:

```jsx
<Pagination
  page={currentPage}
  pageCount={Math.max(1, pageCount)}
  hasNextPage={hasNextPage}
  pageItemCount={visibleManagers.length}
  onPageChange={handlePageChange}
  isLoading={isFetchingNextPage}
/>
```

## 4. `src/components/common/Pagination.jsx`

The current component calculates the displayed range using `total` and
`pageSize`. Replace those props with `hasNextPage` and `pageItemCount`, and
display the page item count instead of a total range. Enable Next when
`hasNextPage` is true; Previous remains enabled only after page one. Refer to
the cursor-specific prop usage above when adapting this component.

## 5. `API_INTEGRATION.md`

Replace the page-based manager-list section with the cursor endpoint path,
response shape, and navigation behavior described in this guide. Note that the
cursor endpoint has no total count or arbitrary sort options.
