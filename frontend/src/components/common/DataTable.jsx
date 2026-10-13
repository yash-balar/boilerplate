import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

const DataTable = ({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyMessage = "No records found.",
  sortBy,
  sortOrder,
  onSort,
}) => {
  const cellCount = columns.length;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="bg-slate-50/80">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                aria-sort={
                  column.sortKey && sortBy === column.sortKey
                    ? sortOrder === "asc" ? "ascending" : "descending"
                    : undefined
                }
                className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${column.headerClassName || ""}`}
              >
                {column.sortKey && onSort ? (
                  <button
                    type="button"
                    onClick={() => onSort(column.sortKey)}
                    aria-label={`Sort by ${typeof column.header === "string" ? column.header : column.sortKey} ${
                      sortBy === column.sortKey && sortOrder === "asc" ? "descending" : "ascending"
                    }`}
                    className="inline-flex items-center gap-1.5 text-left transition hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500"
                  >
                    {column.header}
                    {sortBy === column.sortKey
                      ? sortOrder === "asc"
                        ? <ArrowUp size={14} aria-hidden="true" />
                        : <ArrowDown size={14} aria-hidden="true" />
                      : <ArrowUpDown size={14} className="text-slate-400" aria-hidden="true" />}
                  </button>
                ) : column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={cellCount} className="px-5 py-16 text-center text-sm text-slate-500">
                Loading...
              </td>
            </tr>
          ) : data.length ? (
            data.map((row) => (
              <tr key={rowKey(row)} className="transition hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-4 text-sm text-slate-600 ${column.cellClassName || ""}`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={cellCount} className="px-5 py-16 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
