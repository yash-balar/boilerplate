import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

const SearchInput = ({
  onSearch,
  placeholder = "Search...",
  label = "Search",
  debounceMs = 300,
}) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => onSearch(value.trim()), debounceMs);
    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, onSearch, value]);

  return (
    <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 text-slate-400 shadow-sm transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 sm:max-w-sm">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full min-w-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={15} />
        </button>
      )}
    </label>
  );
};

export default SearchInput;
