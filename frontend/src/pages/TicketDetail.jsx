import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { AppShell } from "../components/AppShell";
import {
  Card,
  ErrorBanner,
  Modal,
  PriorityBadge,
  Spinner,
  StatusBadge,
  TypeBadge,
  fmtDateTime,
  fmtDue,
  initials,
  timeAgo,
} from "../components/ui";

const roleTone = {
  admin: "bg-ink-800 text-white",
  agent: "bg-acid-400 text-ink-950",
  customer: "bg-ink-100 text-ink-700",
};

const staffTransitions = (status, role) => {
  const actions = [];
  if (status !== "open") {
    actions.push({ to: "open", label: "Reopen" });
  }
  if (status !== "on_hold") {
    actions.push({ to: "on_hold", label: "Pause / Hold" });
  }
  if (status !== "escalated") {
    actions.push({ to: "escalated", label: "Escalate" });
  }
  if (status !== "closed") {
    actions.push({ to: "closed", label: "Mark closed" });
  }
  if (status === "closed" && role === "admin") {
    actions.push({ to: "archived", label: "Archive" });
  }
  return actions;
};

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isStaff = user.role !== "customer";

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const [busy, setBusy] = useState("");
  const [escOpen, setEscOpen] = useState(false);
  const [escReason, setEscReason] = useState("");
  const [escError, setEscError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [tRes, mRes] = await Promise.all([
          client.get(`/tickets/${id}`),
          client.get(`/tickets/${id}/messages`),
        ]);
        if (!active) return;
        setTicket(tRes.data);
        setMessages(mRes.data || []);
        setError("");
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();

    if (isStaff) {
      client
        .get("/users/agents")
        .then((res) => {
          if (active) setAgents(res.data || []);
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [id, isStaff]);

  const postMessage = async () => {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      const res = await client.post(`/tickets/${id}/messages`, {
        body: text,
        isInternal: isStaff ? internal : false,
      });
      setMessages((prev) => [...prev, res.data]);
      setBody("");
      setInternal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const doTransition = async (to, reason) => {
    setBusy(to);
    try {
      const payload = { status: to };
      if (to === "escalated") {
        payload.escalationReason = reason.trim();
      }
      const res = await client.patch(`/tickets/${id}/status`, payload);
      setTicket(res.data);
      setEscOpen(false);
      setEscReason("");
      setEscError("");
    } catch (err) {
      if (to === "escalated") {
        setEscError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setBusy("");
    }
  };

  const handleTransition = (to) => {
    if (to === "escalated") {
      setEscOpen(true);
      return;
    }
    doTransition(to);
  };

  const handleAssign = async (agentId) => {
    if (!agentId) return;
    setBusy("assign");
    try {
      const res = await client.patch(`/tickets/${id}/assign`, {
        assignedTo: agentId,
      });
      setTicket(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <Spinner label="Loading ticket" />
      </AppShell>
    );
  }

  if (error && !ticket) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl">
          <ErrorBanner message={error} />
        </div>
      </AppShell>
    );
  }

  if (!ticket) return null;

  const due = fmtDue(ticket.dueAt);
  const transitions = isStaff
    ? staffTransitions(ticket.status, user.role)
    : [];

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className={"flex flex-wrap items-start justify-between " +
               "gap-3"}>
              <div>
                <p className="font-mono text-xs text-ink-400">
                  {ticket.ticketNumber}
                </p>
                <h1 className={"mt-1 font-display text-xl font-bold " +
                   "text-ink-950"}>
                  {ticket.subject}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <TypeBadge type={ticket.type} />
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="text-ink-500">
                  Raised by {ticket.requester?.name}
                </p>
                <p className="text-xs text-ink-400">
                  {ticket.requester?.email}
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  {fmtDateTime(ticket.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-ink-50/60 p-4">
              <p className="text-sm leading-relaxed text-ink-800">
                {ticket.description}
              </p>
            </div>

            {ticket.escalationReason && (
              <div className={"mt-4 rounded-xl border border-rose-200 " +
                 "bg-rose-50 px-4 py-3"}>
                <p className={"text-xs font-bold uppercase tracking-wider " +
                   "text-rose-700"}>
                  Escalation reason
                </p>
                <p className="mt-1 text-sm text-rose-800">
                  {ticket.escalationReason}
                </p>
              </div>
            )}
          </Card>

          <Card className="mt-6 p-6">
            <h2 className="font-display text-base font-bold text-ink-950">
              Conversation
            </h2>

            {messages.length === 0 && (
              <p className="mt-4 text-sm text-ink-400">
                No messages yet.
              </p>
            )}

            <div className="mt-4 space-y-4">
              {messages.map((m) => (
                <div key={m._id} className="flex gap-3">
                  <span
                    className={
                      `flex h-8 w-8 shrink-0 items-center justify-center ` +
                      `rounded-full text-xs font-bold ` +
                      `${roleTone[m.sender?.role] || roleTone.customer}`
                    }
                  >
                    {initials(m.sender?.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={
                        `rounded-xl border px-4 py-3 ` +
                        (m.isInternal
                          ? "border-amber-200 bg-amber-50"
                          : "border-ink-100 bg-white")
                      }
                    >
                      {m.isInternal && (
                        <p
                          className={
                            "mb-1 inline-flex items-center " +
                            "gap-1 rounded-full bg-amber-200/60 px-2 " +
                            "py-0.5 text-[10px] font-bold uppercase " +
                            "tracking-wide text-amber-800"
                          }
                        >
                          🔒 Internal agent note
                        </p>
                      )}
                      <p className="text-sm leading-relaxed text-ink-800">
                        {m.body}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-ink-400">
                      {m.sender?.name} · {m.sender?.role} ·{" "}
                      {timeAgo(m.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {ticket.status !== "archived" ? (
              <div className="mt-6 border-t border-ink-100 pt-5">
                {isStaff && (
                  <label className={"mb-3 flex items-center gap-2 " +
                     "text-sm text-ink-600"}>
                    <input
                      type="checkbox"
                      checked={internal}
                      onChange={(e) => setInternal(e.target.checked)}
                      className="h-4 w-4 rounded border-ink-300"
                    />
                    Post as internal note (agents only)
                  </label>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={2}
                    placeholder="Write a reply…"
                    className="input-field resize-y"
                  />
                  <button
                    type="button"
                    onClick={postMessage}
                    disabled={sending || !body.trim()}
                    className="btn-primary shrink-0 self-end"
                  >
                    {sending ? "Posting…" : "Post"}
                  </button>
                </div>
              </div>
            ) : (
              <p className={"mt-6 rounded-xl bg-slate-100 px-4 py-3 " +
                 "text-sm text-slate-600"}>
                This ticket is archived and locked. No replies
                are accepted.
              </p>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-5">
            <h3 className={"text-xs font-bold uppercase tracking-wider " +
               "text-ink-400"}>
              Status
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status={ticket.status} />
            </div>

            {ticket.status === "archived" ? (
              <p className="mt-3 text-xs text-ink-400">
                Archived {fmtDateTime(ticket.archivedAt)}
              </p>
            ) : !isStaff ? (
              ticket.status === "closed" ? (
                <p className="mt-3 text-xs text-ink-400">
                  Closed {fmtDateTime(ticket.closedAt)}
                </p>
              ) : (
                <button
                  type="button"
                  disabled={busy === "closed"}
                  onClick={() => handleTransition("closed")}
                  className="btn-primary mt-4 w-full"
                >
                  {busy === "closed" ? "Closing…" : "Close ticket"}
                </button>
              )
            ) : (
              <div className="mt-4 space-y-2">
                {transitions.map((a) => (
                  <button
                    key={a.to}
                    type="button"
                    disabled={busy === a.to}
                    onClick={() => handleTransition(a.to)}
                    className="btn-ghost w-full justify-start text-xs"
                  >
                    {busy === a.to ? "Updating…" : a.label}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {isStaff && (
            <Card className="p-5">
              <h3 className={"text-xs font-bold uppercase tracking-wider " +
                 "text-ink-400"}>
                Assign
              </h3>
              <select
                value={ticket.assignedTo?._id || ""}
                onChange={(e) => handleAssign(e.target.value)}
                disabled={busy === "assign" || ticket.status === "archived"}
                className="input-field mt-3"
              >
                <option value="">
                  {ticket.assignedTo
                    ? ticket.assignedTo.name
                    : "Unassigned"}
                </option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </Card>
          )}

          <Card className="p-5">
            <h3 className={"text-xs font-bold uppercase tracking-wider " +
               "text-ink-400"}>
              Classification
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-400">Category</dt>
                <dd className="text-right font-medium text-ink-800">
                  {ticket.category?.name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Subcategory</dt>
                <dd className="text-right font-medium text-ink-800">
                  {ticket.subcategory}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Type</dt>
                <dd className="text-right font-medium text-ink-800">
                  {ticket.type.replace("_", " ")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Priority</dt>
                <dd className="text-right font-medium text-ink-800">
                  {ticket.priority}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h3 className={"text-xs font-bold uppercase tracking-wider " +
               "text-ink-400"}>
              SLA
            </h3>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-ink-500">Due</span>
              <span
                className={
                  `rounded-full px-2.5 py-0.5 text-xs font-semibold ` +
                  `tabular-nums ` +
                  (due.tone === "rose"
                    ? "bg-red-50 text-red-700"
                    : due.tone === "amber"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600")
                }
              >
                {due.text}
              </span>
            </div>
            <p className="mt-2 text-xs text-ink-400">
              {fmtDateTime(ticket.dueAt)}
            </p>
            {ticket.closedAt && (
              <p className="mt-3 text-xs text-ink-400">
                Closed {fmtDateTime(ticket.closedAt)}
              </p>
            )}
            {ticket.archivedAt && (
              <p className="mt-1 text-xs text-ink-400">
                Archived {fmtDateTime(ticket.archivedAt)}
              </p>
            )}
          </Card>
        </aside>
      </div>

      <Modal
        open={escOpen}
        title="Escalate ticket"
        onClose={() => setEscOpen(false)}
      >
        <p className="text-sm text-ink-500">
          Escalation requires a reason (min 5 characters).
          Tier-2 engineering or risk leadership will pick this up.
        </p>
        {escError && (
          <div className="mt-3">
            <ErrorBanner message={escError} />
          </div>
        )}
        <textarea
          value={escReason}
          onChange={(e) => setEscReason(e.target.value)}
          rows={3}
          placeholder="Why is this being escalated?"
          className="input-field mt-3 resize-y"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEscOpen(false)}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy === "escalated" || escReason.trim().length < 5}
            onClick={() => doTransition("escalated", escReason)}
            className="btn-primary"
          >
            {busy === "escalated" ? "Escalating…" : "Escalate"}
          </button>
        </div>
      </Modal>
    </AppShell>
  );
};

export default TicketDetail;
