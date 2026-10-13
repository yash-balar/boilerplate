import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  isLoading = false,
}) => {
  const firstItem = total ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{firstItem}–{lastItem}</span> of{" "}
        <span className="font-medium text-slate-700">{total}</span> results
      </p>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={15} /> Previous
        </button>
        <span className="px-2 text-xs font-medium tabular-nums text-slate-500">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          disabled={page >= pageCount || isLoading}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? "Loading..." : "Next"} <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
