import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ellipsis,
  Mail,
  Plus,
  Users,
} from "lucide-react";
import DataTable from "../../components/common/DataTable";
import FilterDropdown from "../../components/common/FilterDropdown";
import Pagination from "../../components/common/Pagination";
import SearchInput from "../../components/common/SearchInput";
import { useDeleteManager, useManagers } from "../../api/managers/managers.hook";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import { hasPermission, PERMISSIONS } from "../../utils/permissions";

const limit = 10;
const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];
const sortByOptions = [
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
  { value: "department", label: "Department" },
  { value: "createdAt", label: "Created date" },
];

const Managers = () => {
  const canCreate = hasPermission(PERMISSIONS.MANAGERS_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.MANAGERS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.MANAGERS_DELETE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    isFetchingNextPage,
  } = useManagers({
    limit,
    search,
    status: statusFilter,
    sortBy,
    sortOrder,
  });
  const deleteManager = useDeleteManager();

  const loadedPages = data?.pages ?? [];
  const firstPage = loadedPages[0];
  const total = firstPage?.total ?? 0;
  const pageCount = Math.max(1, firstPage?.totalPages ?? 1);
  const currentPage = Math.min(page, pageCount);
  const visibleManagers = loadedPages.find((managerPage) => managerPage.page === currentPage)?.items ?? [];

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleSortByChange = useCallback((value) => {
    setSortBy(value);
    setPage(1);
  }, []);

  const handleSortOrderChange = useCallback((value) => {
    setSortOrder(value);
    setPage(1);
  }, []);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder((current) => current === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  }, [sortBy]);

  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  }, []);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pageCount) return;
    if (loadedPages.some((managerPage) => managerPage.page === nextPage)) {
      setPage(nextPage);
      return;
    }

    if (nextPage === (data?.pages.at(-1)?.page ?? 0) + 1 && !isFetchingNextPage) {
      fetchNextPage().then(({ data: nextData }) => {
        if (nextData?.pages.some((managerPage) => managerPage.page === nextPage)) {
          setPage(nextPage);
        }
      });
    }
  };

  const confirmDelete = () => {
    if (!managerToDelete) return;
    deleteManager.mutate(managerToDelete.id, {
      onSuccess: () => setManagerToDelete(null),
    });
  };

  const columns = [
    {
      key: "manager",
      header: "Manager",
      sortKey: "name",
      render: (manager) => {
        const initials = manager.name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();
        return (
          <div className="flex min-w-56 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-slate-900">{manager.name}</span>
              <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                <Mail size={12} /> {manager.email}
              </span>
            </span>
          </div>
        );
      },
    },
    {
      key: "department",
      header: "Department",
      sortKey: "department",
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "phone",
      header: "Phone",
      render: (manager) => manager.phone || <span className="text-slate-400">Not provided</span>,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "status",
      header: "Status",
      sortKey: "status",
      render: (manager) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
          manager.status === "Active"
            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
            : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
        }`}>
          <span className={`size-1.5 rounded-full ${manager.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
          {manager.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (manager) => (
        <details className="group relative inline-block text-left">
          <summary
            aria-label={`Actions for ${manager.name}`}
            className="grid size-9 cursor-pointer list-none place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 [&::-webkit-details-marker]:hidden"
          >
            <Ellipsis size={19} />
          </summary>
          <div className="absolute right-0 z-10 mt-1 grid min-w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
            <Link
              to={`/manager/${manager.id}`}
              className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              View details
            </Link>
            {canUpdate && (
              <Link
                to={`/manager/${manager.id}/edit`}
                className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Edit
              </Link>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => setManagerToDelete(manager)}
                className="rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
            )}
          </div>
        </details>
      ),
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-indigo-600">People / Directory</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Managers</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Keep your team directory up to date and easy to manage.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/manager/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus size={17} /> Add manager
          </Link>
        )}
      </div>

      {isError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Could not load managers: {error.message}
        </div>
      )}
      {deleteManager.isError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Could not delete manager: {deleteManager.error.message}
        </div>
      )}

      <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={19} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">All managers</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {total} {total === 1 ? "person" : "people"} in your directory
              </p>
            </div>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <SearchInput
              onSearch={handleSearch}
              placeholder="Search by name, email or team"
              label="Search managers"
            />
            <FilterDropdown
              name="Manager status"
              options={statusOptions}
              value={statusFilter}
              onChange={handleStatusChange}
              sortBy={sortBy}
              sortByOptions={sortByOptions}
              onSortByChange={handleSortByChange}
              sortOrder={sortOrder}
              onSortOrderChange={handleSortOrderChange}
              onClear={clearFilters}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={visibleManagers}
          rowKey={(manager) => manager.id}
          isLoading={isLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage={
            total
              ? "No managers match your search or filters."
              : "No managers yet. Add your first manager to get started."
          }
        />
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          total={total}
          pageSize={limit}
          onPageChange={handlePageChange}
          isLoading={isFetchingNextPage}
        />
      </div>

      <ConfirmationDialog
        open={Boolean(managerToDelete)}
        onOpenChange={(open) => {
          if (!open) setManagerToDelete(null);
        }}
        title="Delete this manager?"
        description={(
          <>
            <span className="font-medium text-slate-700">{managerToDelete?.name}</span>
            {" "}will be removed from the directory. This can’t be undone.
          </>
        )}
        confirmLabel="Delete manager"
        onConfirm={confirmDelete}
        isPending={deleteManager.isPending}
      />
    </section>
  );
};

export default Managers;
