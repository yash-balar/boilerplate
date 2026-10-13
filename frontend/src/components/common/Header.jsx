import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:h-16 sm:px-8">
      <span className="text-xs font-medium text-slate-500 sm:text-sm">Team management</span>
      <Link
        to="/profile"
        aria-label="Open profile"
        className="flex items-center gap-2.5 rounded-full text-sm font-medium text-slate-700 no-underline outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <span className="grid size-8 place-items-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700">AD</span>
        <span className="hidden sm:inline">Admin</span>
      </Link>
    </header>
  );
};

export default Header