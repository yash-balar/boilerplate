import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isPending = false,
  variant = "danger",
  icon: Icon = AlertTriangle,
}) => (
  <Dialog
    open={open}
    onOpenChange={(nextOpen) => {
      if (!isPending) onOpenChange(nextOpen);
    }}
  >
    <DialogContent>
      <DialogHeader className="justify-items-center text-center">
        <span className={`grid size-14 place-items-center rounded-full ${
          variant === "danger"
            ? "bg-rose-50 text-rose-600"
            : "bg-indigo-50 text-indigo-600"
        }`}>
          <Icon size={26} aria-hidden="true" />
        </span>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelLabel}
        </DialogClose>
        <button
          type="button"
          disabled={isPending}
          onClick={onConfirm}
          className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
            variant === "danger"
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isPending ? "Please wait..." : confirmLabel}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmationDialog;
