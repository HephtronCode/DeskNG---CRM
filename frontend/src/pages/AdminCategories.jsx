import { useEffect, useState } from "react";
import client from "../api/client";
import { AppShell } from "../components/AppShell";
import {
  Card,
  ErrorBanner,
  Spinner,
} from "../components/ui";

const emptyDraft = {
  name: "",
  code: "",
  description: "",
  subcategories: "",
  defaultPriority: "medium",
  slaHours: 24,
  isActive: true,
};

const priorityOptions = ["low", "medium", "high", "critical"];

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(emptyDraft);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    client
      .get("/categories")
      .then((res) => {
        setCategories(res.data || []);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const startCreate = () => {
    setEditId(null);
    setDraft(emptyDraft);
  };

  const startEdit = (c) => {
    setEditId(c._id);
    setDraft({
      name: c.name,
      code: c.code,
      description: c.description || "",
      subcategories: (c.subcategories || []).join(", "),
      defaultPriority: c.defaultPriority,
      slaHours: c.slaHours,
      isActive: c.isActive,
    });
  };

  const cancel = () => {
    setEditId(null);
    setDraft(emptyDraft);
    setError("");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    const payload = {
      name: draft.name.trim(),
      code: draft.code.trim().toUpperCase(),
      description: draft.description.trim(),
      subcategories: draft.subcategories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      defaultPriority: draft.defaultPriority,
      slaHours: Number(draft.slaHours),
      isActive: draft.isActive,
    };

    try {
      if (editId) {
        await client.patch(`/categories/${editId}`, payload);
      } else {
        await client.post("/categories", payload);
      }
      cancel();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    try {
      await client.patch(`/categories/${c._id}`, {
        isActive: !c.isActive,
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const editing = editId !== null || draft.name !== "";

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">
            Category & SLA manager
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            Operational categories drive ticket routing and SLA
            clocks for every new ticket.
          </p>
        </div>
        {!editing && (
          <button onClick={startCreate} className="btn-accent">
            + New category
          </button>
        )}
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {editing && (
        <Card className="mt-6 p-6">
          <h2 className="font-display text-base font-bold text-ink-950">
            {editId ? "Edit category" : "New category"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Name</label>
              <input
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Settlements and Disputes"
                className="input-field mt-1.5"
              />
            </div>
            <div>
              <label className="label-field">Code</label>
              <input
                value={draft.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="e.g. SET"
                maxLength={10}
                className="input-field mt-1.5 font-mono uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">Description</label>
              <textarea
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                placeholder="What this category covers"
                className="input-field mt-1.5 resize-y"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-field">
                Subcategories (comma-separated)
              </label>
              <textarea
                value={draft.subcategories}
                onChange={(e) => set("subcategories", e.target.value)}
                rows={2}
                placeholder="Uncredited Transfer, Chargeback Claim, …"
                className="input-field mt-1.5 resize-y"
              />
            </div>
            <div>
              <label className="label-field">Default priority</label>
              <select
                value={draft.defaultPriority}
                onChange={(e) =>
                  set("defaultPriority", e.target.value)
                }
                className="input-field mt-1.5"
              >
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">SLA hours</label>
              <input
                type="number"
                min={1}
                value={draft.slaHours}
                onChange={(e) => set("slaHours", e.target.value)}
                className="input-field mt-1.5 tabular-nums"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving || !draft.name.trim() || !draft.code.trim()}
              className="btn-primary"
            >
              {saving ? "Saving…" : editId ? "Save changes" : "Create"}
            </button>
            <button onClick={cancel} className="btn-ghost">
              Cancel
            </button>
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="mt-6">
          <Spinner label="Loading categories" />
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {categories.map((c) => (
            <Card key={c._id} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-bold text-ink-950">
                    {c.name}
                  </p>
                  <p className="font-mono text-xs text-ink-400">
                    {c.code}
                  </p>
                </div>
                <span
                  className={
                    `rounded-full px-2.5 py-0.5 text-xs font-semibold ` +
                    (c.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600")
                  }
                >
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {c.description && (
                <p className="mt-2 text-sm text-ink-500">
                  {c.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(c.subcategories || []).map((s) => (
                  <span
                    key={s}
                    className={"rounded-full bg-ink-50 px-2.5 py-0.5 " +
                       "text-xs font-medium text-ink-700"}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-ink-400">SLA </span>
                  <span className="font-mono font-bold tabular-nums">
                    {c.slaHours}h
                  </span>
                  <span className="ml-3 text-ink-400">Priority </span>
                  <span className="font-medium">{c.defaultPriority}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(c)}
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default AdminCategories;
