import { ChevronDown } from "lucide-react";
import { Label } from "../ui/label";

const FormSelect = ({
  id,
  label,
  error,
  registration,
  onChange,
  value,
  options = [],
  className = "",
  wrapperClassName = "",
  placeholder,
  ...selectProps
}) => (
  <div className={`space-y-2 ${wrapperClassName}`}>
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={`h-11 w-full appearance-none rounded-xl border bg-white px-3.5 pr-10 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 ${
          error
            ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100"
            : "border-slate-200"
        } ${className}`}
        {...registration}
        onChange={(event) => {
          registration?.onChange?.(event);
          onChange?.(event);
        }}
        {...(value !== undefined ? { value } : {})}
        {...selectProps}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
    {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
  </div>
);

export default FormSelect;
