import { useState } from "react";
import { ChevronDown, ListFilter } from "lucide-react";
import FormSelect from "./FormSelect";

const FilterDropdown = ({
  label = "Filter",
  options,
  value,
  onChange,
  name = "Filter",
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  sortByOptions = [],
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const hasActiveFilter = value !== options[0]?.value
    || (sortByOptions.length > 0 && sortBy !== "createdAt")
    || (sortOrder && sortOrder !== "desc");

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-11 items-center gap-2 rounded-xl border bg-white px-3.5 text-sm font-medium shadow-sm transition hover:border-slate-300 hover:bg-slate-50 ${
          hasActiveFilter ? "border-indigo-200 text-indigo-700" : "border-slate-200 text-slate-700"
        }`}
      >
        <ListFilter size={16} />
        {label}
        {hasActiveFilter && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close filters"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 grid w-64 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
            <FormSelect
              id="manager-status-filter"
              label={name}
              value={value}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              options={options}
              className="h-10 rounded-lg"
            />
            {sortByOptions.length > 0 && (
              <FormSelect
                id="manager-sort-by"
                label="Sort by"
                value={sortBy}
                onChange={(event) => onSortByChange(event.target.value)}
                options={sortByOptions}
                className="h-10 rounded-lg"
              />
            )}
            {sortByOptions.length > 0 && (
              <FormSelect
                id="manager-sort-order"
                label="Sort order"
                value={sortOrder}
                onChange={(event) => onSortOrderChange(event.target.value)}
                options={[
                  { value: "asc", label: "Ascending" },
                  { value: "desc", label: "Descending" },
                ]}
                className="h-10 rounded-lg"
              />
            )}
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                disabled={!hasActiveFilter}
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Clear filters
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FilterDropdown;
