import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { AppShell } from "../components/AppShell";
import { Card, ErrorBanner } from "../components/ui";

const typeOptions = [
  { value: "incident", label: "Incident" },
  { value: "service_request", label: "Service Request" },
  { value: "inquiry", label: "Inquiry" },
  { value: "complaint", label: "Complaint" },
];

const priorityOptions = ["low", "medium", "high", "critical"];

const CreateTicket = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    type: "incident",
    category: "",
    subcategory: "",
    priority: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    client
      .get("/categories")
      .then((res) => setCategories(res.data || []))
      .catch((err) => setError(err.message));
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === form.category) || null,
    [categories, form.category],
  );

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "category") {
      setForm((prev) => ({ ...prev, subcategory: "" }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await client.post("/tickets", {
        subject: form.subject,
        description: form.description,
        type: form.type,
        category: form.category,
        subcategory: form.subcategory,
        priority: form.priority || undefined,
      });
      navigate("/dashboard", { state: { created: res.data } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl font-bold text-ink-950">
          Raise a ticket
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Classify the issue so SLAs and routing kick in.
        </p>

        <Card className="mt-6 p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            {error && <ErrorBanner message={error} />}

            <div>
              <label className="label-field" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                required
                minLength={5}
                maxLength={120}
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
                placeholder="Short, specific summary of the issue"
                className="input-field mt-1.5"
              />
            </div>

            <div>
              <label className="label-field" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                required
                minLength={10}
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What happened, when, and what you expected"
                className="input-field mt-1.5 resize-y"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label-field" htmlFor="type">
                  Ticket type
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className="input-field mt-1.5"
                >
                  {typeOptions.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field" htmlFor="priority">
                  Priority (optional)
                </label>
                <select
                  id="priority"
                  value={form.priority}
                  onChange={(e) => set("priority", e.target.value)}
                  className="input-field mt-1.5"
                >
                  <option value="">
                    Use category default
                  </option>
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label-field" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  required
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="input-field mt-1.5"
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field" htmlFor="subcategory">
                  Subcategory
                </label>
                <select
                  id="subcategory"
                  required
                  disabled={!selectedCategory}
                  value={form.subcategory}
                  onChange={(e) => set("subcategory", e.target.value)}
                  className="input-field mt-1.5 disabled:opacity-50"
                >
                  <option value="">
                    {selectedCategory
                      ? "Select a subcategory…"
                      : "Choose a category first"}
                  </option>
                  {(selectedCategory?.subcategories || []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCategory && (
              <div
                className={
                  "rounded-xl border border-acid-400/40 " +
                  "bg-acid-200/20 px-4 py-3"
                }
              >
                <p
                  className={
                    "text-xs font-bold uppercase tracking-wider " +
                    "text-ink-500"
                  }
                >
                  SLA preview
                </p>
                <p className="mt-1 text-sm text-ink-800">
                  <strong>{selectedCategory.name}</strong> targets
                  resolution within{" "}
                  <span className="font-mono font-bold tabular-nums">
                    {selectedCategory.slaHours}h
                  </span>{" "}
                  (default priority: {selectedCategory.defaultPriority}).
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="btn-accent"
              >
                {submitting ? "Creating…" : "Create ticket"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
};

export default CreateTicket;
