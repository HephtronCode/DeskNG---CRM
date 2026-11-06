import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { AppShell } from "../components/AppShell";
import {
  Card,
  EmptyState,
  ErrorBanner,
  Pagination,
  PriorityBadge,
  Spinner,
  StatusBadge,
  TypeBadge,
  fmtDate,
  fmtDue,
  initials,
} from "../components/ui";

const kpiCards = [
  { key: "open", label: "Open", dot: "bg-blue-500" },
  { key: "onHold", label: "On Hold", dot: "bg-amber-500" },
  { key: "escalated", label: "Escalated", dot: "bg-rose-500" },
  { key: "closed", label: "Closed", dot: "bg-emerald-500" },
  { key: "unassigned", label: "Unassigned", dot: "bg-ink-400" },
  { key: "slaBreached", label: "SLA Breached", dot: "bg-red-600" },
];

const statusOptions = [
  "open",
  "on_hold",
  "escalated",
  "closed",
  "archived",
];

const typeOptions = [
  "incident",
  "service_request",
  "inquiry",
  "complaint",
];

const priorityOptions = ["low", "medium", "high", "critical"];

const selectCls = "input-field !w-auto text-sm";

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isStaff = user.role !== "customer";

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    type: "",
    category: "",
    includeArchived: false,
  });

  const [tickets, setTickets] = useState(null);
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const created = location.state?.created;

  // Debounce the search input.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load categories for the filter dropdown.
  useEffect(() => {
    client
      .get("/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Load stats once for staff members.
  useEffect(() => {
    if (!isStaff) return;
    client
      .get("/tickets/stats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, [isStaff]);

  // Load the ticket queue for the current filters.
  useEffect(() => {
    let active = true;
    setTickets(null);

    const params = {
      page,
      limit: 10,
    };
    if (search) params.search = search;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.includeArchived) params.includeArchived = "true";

    client
      .get("/tickets", { params })
      .then((res) => {
        if (!active) return;
        setTickets(res.data || []);
        setMeta(res.meta || null);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setTickets([]);
        setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [page, search, filters]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      priority: "",
      type: "",
      category: "",
      includeArchived: false,
    });
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className={
              "text-xs font-bold uppercase tracking-wider " +
              "text-ink-400"
            }
          >
            {isStaff ? "Queue overview" : "My workspace"}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink-950">
            {isStaff ? "Operations Queue" : "My Tickets"}
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            {isStaff
              ? "Triage, track, and meet every SLA."
              : "Your tickets, their status, and SLA clock."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={
              "rounded-full border border-ink-200 bg-white px-3 " +
              "py-1.5 text-xs font-semibold capitalize text-ink-600"
            }
          >
            {user.role}
          </span>
          <Link to="/tickets/new" className="btn-accent">
            + New ticket
          </Link>
        </div>
      </div>

      {created && (
        <div
          className={
            "mt-6 rounded-xl border border-emerald-200 " +
            "bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          }
        >
          Ticket <strong>{created.ticketNumber}</strong> created.
          It is now in the queue.
        </div>
      )}

      {isStaff && stats && (
        <div
          className={
            "mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 " +
            "xl:grid-cols-6"
          }
        >
          {kpiCards.map((kpi) => (
            <Card
              key={kpi.key}
              className="px-4 py-3.5 transition hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${kpi.dot}`} />
                <p
                  className={
                    "text-xs font-semibold uppercase " +
                    "tracking-wide text-ink-400"
                  }
                >
                  {kpi.label}
                </p>
              </div>
              <p
                className={
                  "mt-2 font-display text-2xl font-bold " +
                  "tabular-nums text-ink-950"
                }
              >
                {stats[kpi.key] ?? 0}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-6 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.5-4.5" />
            </svg>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search TKT-xxxx or subject…"
              className="input-field !w-64 pl-9"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className={selectCls}
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilter("priority", e.target.value)}
            className={selectCls}
          >
            <option value="">All priorities</option>
            {priorityOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilter("type", e.target.value)}
            className={selectCls}
          >
            <option value="">All types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilter("category", e.target.value)}
            className={selectCls}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {isStaff && (
            <label
              className={
                "flex items-center gap-2 text-sm " +
                "text-ink-600"
              }
            >
              <input
                type="checkbox"
                checked={filters.includeArchived}
                onChange={(e) =>
                  setFilter("includeArchived", e.target.checked)
                }
                className="h-4 w-4 rounded border-ink-300"
              />
              Include archived
            </label>
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="btn-ghost px-3 py-2 text-xs"
          >
            Reset
          </button>
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden">
        {error && (
          <div className="p-4">
            <ErrorBanner message={error} />
          </div>
        )}

        {tickets === null && <Spinner label="Loading queue" />}

        {tickets !== null && tickets.length === 0 && !error && (
          <div className="p-6">
            <EmptyState
              title="No tickets match"
              hint={
                isStaff
                  ? "Try clearing filters or search."
                  : "Raise your first ticket to get started."
              }
            >
              {isStaff ? (
                <button onClick={resetFilters} className="btn-ghost">
                  Reset filters
                </button>
              ) : (
                <Link to="/tickets/new" className="btn-accent">
                  Raise your first ticket
                </Link>
              )}
            </EmptyState>
          </div>
        )}

        {tickets !== null && tickets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60">
                  <th
                    className={
                      "px-4 py-3 text-xs font-bold uppercase " +
                      "tracking-wider text-ink-400"
                    }
                  >
                    Ticket
                  </th>
                  <th
                    className={
                      "px-4 py-3 text-xs font-bold uppercase " +
                      "tracking-wider text-ink-400"
                    }
                  >
                    Type
                  </th>
                  <th
                    className={
                      "px-4 py-3 text-xs font-bold uppercase " +
                      "tracking-wider text-ink-400"
                    }
                  >
                    Category
                  </th>
                  <th
                    className={
                      "px-4 py-3 text-xs font-bold uppercase " +
                      "tracking-wider text-ink-400"
                    }
                  >
                    Priority
                  </th>
                  <th
                    className={
                      "px-4 py-3 text-xs font-bold uppercase " +
                      "tracking-wider text-ink-400"
                    }
                  >
                    Status
                  </th>
                  <th
                    className={
                      "px-4 py-3 text-xs font-bold uppercase " +
                      "tracking-wider text-ink-400"
                    }
                  >
                    Requester
                  </th>
                  <th
                    className={
                      "px-4 py-3 text-xs font-bold uppercase " +
                      "tracking-wider text-ink-400"
                    }
                  >
                    Assigned
                  </th>
                  <th
                    className={
                      "px-4 py-3 text-xs font-bold uppercase " +
                      "tracking-wider text-ink-400"
                    }
                  >
                    SLA
                  </th>
                  <th
                    className={
                      "px-4 py-3 text-xs font-bold uppercase " +
                      "tracking-wider text-ink-400"
                    }
                  >
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => {
                  const due = fmtDue(t.dueAt);
                  return (
                    <tr
                      key={t._id}
                      onClick={() => navigate(`/tickets/${t._id}`)}
                      className={
                        `cursor-pointer border-b border-ink-50 transition ` +
                        `hover:bg-ink-50/70 ` +
                        `${i % 2 ? "bg-ink-50/30" : ""}`
                      }
                    >
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-ink-400">
                          {t.ticketNumber}
                        </p>
                        <p
                          className={
                            "mt-0.5 max-w-[220px] truncate " +
                            "font-medium text-ink-900"
                          }
                        >
                          {t.subject}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <TypeBadge type={t.type} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink-800">
                          {t.category?.name || "—"}
                        </p>
                        <p className="text-xs text-ink-400">
                          {t.subcategory}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={
                              "flex h-7 w-7 shrink-0 items-center " +
                              "justify-center rounded-full bg-ink-100 " +
                              "text-[10px] font-bold text-ink-700"
                            }
                          >
                            {initials(t.requester?.name)}
                          </span>
                          <div>
                            <p className="text-ink-800">
                              {t.requester?.name || "—"}
                            </p>
                            <p className="text-xs text-ink-400">
                              {t.requester?.email || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {t.assignedTo ? (
                          <div className="flex items-center gap-2.5">
                            <span
                              className={
                                "flex h-7 w-7 shrink-0 items-center " +
                                "justify-center rounded-full bg-acid-200 " +
                                "text-[10px] font-bold text-ink-800"
                              }
                            >
                              {initials(t.assignedTo.name)}
                            </span>
                            <span className="text-ink-800">
                              {t.assignedTo.name}
                            </span>
                          </div>
                        ) : (
                          <span className="italic text-ink-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            `inline-flex rounded-full px-2.5 py-0.5 ` +
                            `text-xs font-semibold tabular-nums ` +
                            (due.tone === "rose"
                              ? "bg-red-50 text-red-700"
                              : due.tone === "amber"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600")
                          }
                        >
                          {due.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-400">
                        {fmtDate(t.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tickets !== null && (
          <div className="border-t border-ink-100 px-4 py-3">
            <Pagination
              page={page}
              pages={meta?.pages || 1}
              total={meta?.total || 0}
              onPage={setPage}
            />
          </div>
        )}
      </Card>
    </AppShell>
  );
};

export default Dashboard;
