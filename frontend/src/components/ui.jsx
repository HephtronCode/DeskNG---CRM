// Shared UI primitives for DeskNG screens.

const statusStyles = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  on_hold: "bg-amber-50 text-amber-700 border-amber-200",
  escalated: "bg-rose-50 text-rose-700 border-rose-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-600 border-slate-300",
};

const statusLabels = {
  open: "Open",
  on_hold: "On Hold",
  escalated: "Escalated",
  closed: "Closed",
  archived: "Archived",
};

const statusDots = {
  open: "bg-blue-500",
  on_hold: "bg-amber-500",
  escalated: "bg-rose-500",
  closed: "bg-emerald-500",
  archived: "bg-slate-400",
};

export const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full ` +
      `border px-2.5 py-0.5 text-xs font-semibold ` +
      `${statusStyles[status] || statusStyles.open}`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ` +
      `${statusDots[status] || statusDots.open}`} />
    {statusLabels[status] || status}
  </span>
);

const priorityStyles = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-sky-50 text-sky-700 border-sky-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  critical: "bg-red-50 text-red-700 border-red-200 font-bold",
};

export const PriorityBadge = ({ priority }) => (
  <span
    className={`inline-flex rounded-full border px-2.5 py-0.5 ` +
      `text-xs font-semibold ` +
      `${priorityStyles[priority] || priorityStyles.medium}`}
  >
    {priority}
  </span>
);

export const TypeBadge = ({ type }) => (
  <span className="text-xs font-medium text-ink-400">
    {type.replace("_", " ")}
  </span>
);

export const Card = ({ children, className = "" }) => (
  <div className={`card ${className}`}>{children}</div>
);

export const Spinner = ({ label = "Loading" }) => (
  <div className="flex items-center justify-center gap-3 py-10">
    <svg
      className="h-5 w-5 animate-spin text-ink-400"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    <span className="text-sm text-ink-400">{label}…</span>
  </div>
);

export const EmptyState = ({ title, hint, children }) => (
  <div
    className={
      "flex flex-col items-center justify-center rounded-2xl " +
      "border-2 border-dashed border-ink-200 bg-white px-6 py-12"
    }
  >
    <p className="font-display text-base font-semibold text-ink-700">
      {title}
    </p>
    {hint && (
      <p className="mt-1 text-sm text-ink-400">{hint}</p>
    )}
    {children && <div className="mt-4">{children}</div>}
  </div>
);

export const ErrorBanner = ({ message }) => (
  <div
    className={
      "flex items-start gap-2 rounded-xl border border-red-200 " +
      "bg-red-50 px-4 py-3 text-sm text-red-700"
    }
  >
    <svg
      className="mt-0.5 h-4 w-4 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.7 7.2a1.3 1.3 0 112.6 0l-.4 4a.9.9 0 01-1.8 0l-.4-4zm1.3 7.2a1.2 1.2 0 110-2.4 1.2 1.2 0 010 2.4z"
        clipRule="evenodd"
      />
    </svg>
    <span>{message}</span>
  </div>
);

export const Pagination = ({ page, pages, total, onPage }) => {
  if (pages <= 1) {
    return (
      <p className="text-xs text-ink-400">
        {total} ticket{total === 1 ? "" : "s"}
      </p>
    );
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-ink-400">
        Page {page} of {pages} · {total} tickets
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          ← Prev
        </button>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const pad = (n) => String(n).padStart(2, "0");

export const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${pad(d.getDate())} ${d.toLocaleString("en", {
    month: "short",
  })} ${d.getFullYear()}`;
};

export const fmtDue = (iso) => {
  if (!iso) return "—";
  const diffMs = new Date(iso).getTime() - Date.now();
  const hours = Math.round(diffMs / 3600000);
  if (hours < 0) {
    return { text: "SLA breached", tone: "rose" };
  }
  if (hours < 1) {
    return { text: "due < 1h", tone: "amber" };
  }
  if (hours < 48) {
    return { text: `due in ${hours}h`, tone: "amber" };
  }
  return { text: fmtDate(iso), tone: "slate" };
};

export const initials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const timeAgo = (iso) => {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return fmtDate(iso);
};

export const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${fmtDate(iso)} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      className={
        "fixed inset-0 z-50 flex items-center justify-center " +
        "bg-ink-950/50 px-4"
      }
    >
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-950">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={
              "rounded-lg px-2 py-1 text-ink-400 " +
              "hover:bg-ink-50 hover:text-ink-700"
            }
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
