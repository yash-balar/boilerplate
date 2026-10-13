import { Input } from "../ui/input";
import { Label } from "../ui/label";

const FormInput = ({
  id,
  label,
  error,
  registration,
  className = "",
  wrapperClassName = "",
  ...inputProps
}) => (
  <div className={`space-y-2 ${wrapperClassName}`}>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      aria-invalid={Boolean(error)}
      className={`${error ? "border-rose-400 focus-visible:border-rose-400 focus-visible:ring-rose-100" : ""} ${className}`}
      {...registration}
      {...inputProps}
    />
    {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
  </div>
);

export default FormInput;
