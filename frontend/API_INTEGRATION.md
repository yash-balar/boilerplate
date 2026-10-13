# API integration guide

Manager and profile requests are implemented in their service files and consumed through React Query hooks. Demo data is used only when the API is unavailable (network/no response or HTTP 404); other HTTP errors remain visible in the UI. Fallbacks are logged to the browser console.

## Shared API setup

- Configure `VITE_API_BASE_URL` in the frontend environment (for example, `http://localhost:5000/api` for local development or `https://api.example.com/api` in production). The frontend defaults to `http://localhost:5000/api`.
- Keep shared Axios defaults and interceptors in `src/api/axiosClient.js`.
- Query cache defaults live in `src/api/queryClient.js`; `QueryClientProvider` is already mounted in `src/App.jsx`.
- Keep each resource's requests in its service file and React Query operations in its hook file.
- Run the Express/MongoDB backend using the setup in `backend/README.md`. Requests to protected routes automatically include the stored bearer token; logout clears it and invalidates server-issued tokens.

## Managers

The table, form, and detail pages use `src/api/managers/managers.hook.jsx`. Requests live in `src/api/managers/managers.service.js`; the UI expects a manager shaped like:

```js
{
  id: "manager-id",
  name: "Alex Morgan",
  email: "alex@example.com",
  department: "Operations",
  phone: "+1 555 0100",
  status: "Active", // or "Inactive"
  createdAt: "2026-01-01T00:00:00.000Z"
}
```

Map each operation to the backend:

| Operation | Service function | Suggested request | Existing UI consumer |
| --- | --- | --- | --- |
| List | `getManagers` | `GET /managers` | `src/pages/manager/Managers.jsx` through `useManagers` |
| View | `getManager(id)` | `GET /managers/:id` | `src/pages/manager/ManagerDetails.jsx` through `useManager` |
| Add | `createManager(payload)` | `POST /managers` | `src/pages/manager/ManagerForm.jsx` through `useCreateManager` |
| Edit | `updateManager({ id, ...payload })` | `PUT /managers/:id` | `src/pages/manager/ManagerForm.jsx` through `useUpdateManager` |
| Delete | `deleteManager(id)` | `DELETE /managers/:id` | `src/pages/manager/Managers.jsx` through `useDeleteManager` |

Single manager requests use `axiosClient`; for example:

```js
export const getManager = async (managerId) => {
  const { data } = await axiosClient.get(`/managers/${managerId}`);
  return data;
};
```

The service functions already call these endpoints and fall back to the in-memory manager data on network/no-response and 404 errors. Keep manager mutation invalidation in `managers.hook.jsx` so list/detail data refreshes after create, edit, and delete.

### Switch the manager list to server-side search, filters, and pagination

The manager list sends search, status, and page size to the API through `useInfiniteQuery`. It requests subsequent pages on demand and retains loaded pages so Previous works without another request. Use a response such as:

```json
{
  "items": [{ "id": "manager-id", "name": "Alex Morgan" }],
  "total": 42,
  "page": 2,
  "limit": 10,
  "totalPages": 6
}
```

`items` must contain only the requested page; `total` is the number of records matching the search and filters across all pages. Page numbers are one-based, and the UI currently requests 10 rows per page. The request always includes `page` and `limit`; trimmed `search` and active filters (currently `status`) are added only when set. The service normalizes common response keys (`items`/`data`/`managers`/`results`, `page`/`pageNumber`/`currentPage`, and `totalPages`/`pageCount`/`last_page`), including nested `meta` or `pagination` objects. Update `normalizeManagerPage` in `src/api/managers/managers.service.js` if the backend uses a different envelope.

The existing request sends `page`, `limit`, `sortBy`, and `sortOrder` on every request, adds `search` only when non-empty, and adds `status` only when it is not `"all"`. Sort keys available in the UI are `name`, `email`, `department`, and `createdAt`; sort order is `asc` or `desc`. Change the query parameter names only in `getManagers` if the backend uses different names:

   ```js
   params: { page, limit, sortBy, sortOrder, ...(search ? { search } : {}), ...(status !== "all" ? { status } : {}) }
   ```

The `useManagers` query key includes the search, status, and page-size filters. The page resets to page one after a search/filter change and clamps the current page if a deletion reduces the number of pages. Keep those behaviors if changing the list UI.

`useManagers` is only consumed by `src/pages/manager/Managers.jsx`, so no other page needs list params. `useManager(id)` remains the separate single-record query for the view and edit screens.

## Profile

Profile query and update operations are in `src/api/profile/profile.service.js` and `src/api/profile/profile.hook.jsx`. `src/utils/profileData.js` remains the demo fallback.

Suggested endpoints:

| Operation | Suggested request |
| --- | --- |
| Read profile | `GET /profile` |
| Update personal details and optional picture | `PATCH /profile` as `multipart/form-data`; profile fields plus `avatarFile` |
| Change password | `PATCH /profile/password` with the current and new password |

The page has fields for first name, last name, email, age, phone, and role, plus an optional password change. A non-empty new password is sent separately as `{ newPassword }` to `PATCH /profile/password`; blank password fields are omitted. Save changes sends one `multipart/form-data` request with profile fields and an `avatarFile` part. `avatarFile` contains the selected image when changed, or an empty string when no new file is selected. The existing `profilePicture` URL is included when unchanged; if the user removes it, an empty `profilePicture` is submitted. When a new file is selected, the preview data URL is not sent as text—the backend should store `avatarFile` and return the resulting image URL in the profile response under `profilePicture`, `avatarUrl`, `avatar_url`, `avatar`, `image`, `profileImage`, or `profile_image`. Profile reads normalize those common URL fields back to `profilePicture`. In demo fallback mode the uploaded file is kept as a data URL. Do not persist passwords in profile data or return them in the profile response.

## Authentication and logout

Login, registration, and logout requests are in `src/api/auth/auth.service.js`; their mutations are in `src/api/auth/auth.hook.jsx`. Successful login/registration stores the bearer token, and the Axios client adds it to protected requests. The logout confirmation in `src/components/common/Sidebar.jsx` calls the API and clears both credentials and cached data before navigating to `/login`. Public registration supports employee/manager roles; admin assignment is not available through the public registration endpoint.

## Shared confirmation dialog

Use `src/components/common/ConfirmationDialog.jsx` for actions that require confirmation. Provide `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, and `onConfirm`; use `isPending` to prevent dismissing or submitting while the operation is running. Set `variant="danger"` for destructive operations and `variant="default"` for neutral actions.
