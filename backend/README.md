# API server

## Run locally

1. Install MongoDB Community locally or provide a reachable MongoDB URI.
2. Copy `.env.example` to `.env` and generate a unique secret with `npm run generate:secret`; put the generated key in `JWT_SECRET`. The backend loads `.env` from its root directory before starting. Never commit `.env`.
3. From this directory run `npm install`, then `npm run dev`.
4. Set `VITE_API_BASE_URL=http://localhost:5000/api` in the frontend environment, then run the frontend dev server.

The API listens on port `5000` by default. `GET /api/health` is public. Uploaded avatars are stored in `uploads/` and served under `/uploads/`.

All API responses use `{ success, message, data? }`. Successful creates return HTTP `201`; reads, updates, and actions return HTTP `200`; deletes return HTTP `200` with a JSON response. Failures use the appropriate 4xx/5xx HTTP status and the same response envelope. Login and registration save the active bearer token and its expiry on the user; a new login replaces the previous token, and logout or an expired token ends the session.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create employee/manager account and return bearer token |
| POST | `/api/auth/login` | Public | Authenticate and return bearer token |
| POST | `/api/auth/logout` | Bearer | Revoke the active session |
| PATCH | `/api/auth/password` | Bearer | Change password with `currentPassword` and `newPassword` |
| GET | `/api/managers?page=1&limit=10` | Bearer | Search/filter/sort/paginate manager directory |
| POST | `/api/managers` | Bearer | Create a manager record |
| GET | `/api/managers/:managerId` | Bearer | Read a manager |
| PUT | `/api/managers/:managerId` | Bearer | Update a manager |
| DELETE | `/api/managers/:managerId` | Bearer | Delete a manager |
| GET | `/api/profile` | Bearer | Read authenticated user's profile |
| PATCH | `/api/profile` | Bearer | Update profile as `multipart/form-data` |

Roles are defined in `src/constants/roles.js`, permission keys in `src/constants/permissions.js`, and each role's permissions in `src/constants/rolePermissions.js`. Admin has all permissions; manager can view and add managers but cannot edit or delete them; employee has dashboard and profile read/update permissions only. Login and registration include the effective permissions array in `data.permissions`. The frontend stores it for navigation and UI checks; protected API routes enforce permissions with `requirePermission`.

Manager list query accepts `page`, `limit` (maximum 100), `search` (name/email/department), `status` (`Active` or `Inactive`), `department`, `sortBy` (`name`, `email`, `department`, `status`, `createdAt`), and `sortOrder` (`asc` or `desc`). Response data contains `items`, `total`, `page`, `limit`, and `totalPages`.

`GET /api/managers/cursor` accepts `limit` (maximum 100), `cursor`, `search`, `status`, and `department`. Results are ordered by `createdAt` and `_id`, newest first. Use the returned `nextCursor` as the `cursor` query parameter to fetch the next batch; `hasMore` indicates whether another batch is available. The initial request omits `cursor`.

Profile multipart updates accept text fields `firstName`, `lastName`, `email`, `age`, `phone`, and `profilePicture`, plus optional file field `avatarFile`. An uploaded avatar replaces the old image; submitting `profilePicture` as an empty string without a file removes it. Role cannot be changed through profile update. Profile password changes are a separate request and require both the current and new password.

Public account registration accepts `employee` and `manager` roles only; privileged admin role assignment is not exposed through public registration.
