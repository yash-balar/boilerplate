import { ArrowLeft, Mail, Pencil, Phone, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useManager } from "../../api/managers/managers.hook";
import { hasPermission, PERMISSIONS } from "../../utils/permissions";

const ManagerDetails = () => {
  const { managerId } = useParams();
  const { data: manager, isLoading, isError, error } = useManager(managerId);

  if (isLoading) return <p className="text-sm text-slate-500">Loading manager...</p>;
  if (isError) {
    return (
      <section className="mx-auto w-full max-w-7xl">
        <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Could not load manager: {error.message}
        </div>
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600" to="/manager">
          <ArrowLeft size={16} /> Back to managers
        </Link>
      </section>
    );
  }

  const initials = manager.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <section className="mx-auto w-full max-w-7xl">
      <Link className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600" to="/manager">
        <ArrowLeft size={16} /> Back to managers
      </Link>
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-white px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-lg font-semibold text-white shadow-lg shadow-indigo-600/20">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="mb-1 text-sm font-medium text-indigo-600">Manager profile</p>
                <h1 className="truncate text-2xl font-bold tracking-tight text-slate-950">{manager.name}</h1>
                <p className="mt-1 text-sm text-slate-500">{manager.department}</p>
              </div>
            </div>
            {hasPermission(PERMISSIONS.MANAGERS_UPDATE) && (
              <Link
                to={`/manager/${manager.id}/edit`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
              >
                <Pencil size={15} /> Edit profile
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-2 sm:p-8">
          <DetailCard icon={Mail} label="Email address" value={manager.email} />
          <DetailCard icon={Phone} label="Phone number" value={manager.phone || "Not provided"} />
          <DetailCard icon={Users} label="Department" value={manager.department} />
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs font-medium text-slate-500">Status</p>
            <span className={`mt-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
              manager.status === "Active"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
            }`}>
              <span className={`size-1.5 rounded-full ${manager.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`} />
              {manager.status}
            </span>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
            <p className="text-xs font-medium text-slate-500">Added to directory</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {new Date(manager.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
};

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 p-4">
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500">
      <Icon size={17} />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

export default ManagerDetails;
