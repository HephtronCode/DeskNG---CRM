import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TestimonialTicker from "../components/TestimonialTicker";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#roles", label: "Roles" },
  { href: "#demo", label: "Demo" },
];

const FeatureIcon = ({ name }) => {
  const common = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const paths = {
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    lifecycle: (
      <>
        <path d="M4 6h16M4 12h16M4 18h10" />
        <circle cx="19" cy="18" r="2" />
      </>
    ),
    thread: (
      <>
        <path d="M4 5h16v10H9l-5 4V5z" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.5-4.5" />
      </>
    ),
    admin: (
      <>
        <path d="M4 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        <circle cx="10" cy="7" r="3.5" />
        <path d="M18 9v4M16 11h4" />
      </>
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
};

const features = [
  {
    icon: "clock",
    title: "SLA clocks",
    text: "Every ticket inherits a resolution deadline from its "
      + "category. Overdue work surfaces immediately.",
  },
  {
    icon: "lifecycle",
    title: "Five-state lifecycle",
    text: "Open, on-hold, escalated, closed, archived — with "
      + "enforced transition rules and audit stamps.",
  },
  {
    icon: "thread",
    title: "Threads & internal notes",
    text: "Public replies keep customers current; locked amber "
      + "notes keep staff in the loop.",
  },
  {
    icon: "shield",
    title: "Role-scoped access",
    text: "Customers see only their tickets. Agents see the "
      + "queue; admins see everything.",
  },
  {
    icon: "search",
    title: "Search & filters",
    text: "Find any ticket by number or subject, and slice the "
      + "queue by status, priority, type, or category.",
  },
  {
    icon: "admin",
    title: "Admin control",
    text: "Categories, SLA targets, assignment, archiving, and "
      + "queue analytics — all under one roof.",
  },
];

const steps = [
  {
    n: "01",
    title: "Raise",
    text: "The customer classifies the issue — type, category, "
      + "subcategory — and the SLA clock starts ticking.",
  },
  {
    n: "02",
    title: "Triage",
    text: "Agents filter the queue, assign owners, and act "
      + "against clear due times, not scattered chat.",
  },
  {
    n: "03",
    title: "Resolve",
    text: "Status transitions, escalation reasons, and audit "
      + "stamps close the loop with full accountability.",
  },
];

const roles = [
  {
    name: "Customer",
    tone: "border-ink-100 bg-white",
    bullets: [
      "Raise classified support tickets",
      "Track your own tickets and SLAs",
      "Follow public thread replies",
      "Close a ticket once resolved",
    ],
  },
  {
    name: "Agent",
    tone: "border-acid-400/50 bg-acid-200/10",
    bullets: [
      "Full operations queue with filters",
      "Claim, assign, and escalate work",
      "Post public replies and internal notes",
      "Meet category SLA targets",
    ],
  },
  {
    name: "Admin",
    tone: "border-ink-300 bg-ink-50",
    bullets: [
      "Assign and reassign any ticket",
      "Archive closed records",
      "Manage categories and SLA hours",
      "Monitor queue analytics and breaches",
    ],
  },
];

const credentials = [
  { role: "Admin", email: "admin@desk.ng" },
  { role: "Agent", email: "chioma.okonkwo@desk.ng" },
  { role: "Customer", email: "amina@konga-logistics.ng" },
];

const previewTickets = [
  {
    no: "TKT-1002",
    sub: "Uncredited NIP transfer of NGN 450,000",
    meta: "incident · high · On Hold",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    no: "TKT-1003",
    sub: "Repeated webhook delivery failures",
    meta: "incident · high · Escalated",
    tone: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    no: "TKT-1006",
    sub: "USSD session keeps timing out",
    meta: "inquiry · low · Open",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
  },
];

const Landing = () => {
  const { user, loading, logout } = useAuth();

  return (
    <div className="min-h-screen bg-paper">
      <header
        className={
          "sticky top-0 z-40 border-b border-ink-100 " +
          "bg-paper/90 backdrop-blur"
        }
      >
        <div
          className={
            "mx-auto flex max-w-7xl items-center justify-between " +
            "px-6 py-4"
          }
        >
          <Link to="/" className="flex items-center gap-2">
            <span
              className={
                "flex h-8 w-8 items-center justify-center rounded-lg " +
                "bg-acid-400 font-display text-lg font-bold " +
                "text-ink-950"
              }
            >
              D
            </span>
            <span className="font-display text-lg font-bold text-ink-950">
              Desk<span className="text-ink-500">NG</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={
                  "text-sm font-medium text-ink-500 " +
                  "transition hover:text-ink-950"
                }
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-accent">
                  Go to dashboard
                </Link>
                <button onClick={logout} className="btn-ghost">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero-grid relative overflow-hidden">
          <div
            className={
              "glow-acid pointer-events-none absolute -top-24 " +
              "right-0 h-96 w-96 rounded-full"
            }
          />
          <div
            className={
              "mx-auto grid max-w-7xl items-center gap-12 " +
              "px-6 pb-20 pt-16 lg:grid-cols-2"
            }
          >
            <div>
              <p
                className={
                  "inline-flex items-center gap-2 rounded-full " +
                  "border border-ink-200 bg-white px-3 py-1 text-xs " +
                  "font-semibold text-ink-600"
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-acid-400" />
                Merchant & customer support operations
              </p>

              <h1
                className={
                  "mt-5 font-display text-4xl font-bold leading-tight " +
                  "text-ink-950 sm:text-5xl"
                }
              >
                Every merchant issue,{" "}
                <span className="text-ink-500">tracked to resolution.</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg text-ink-500">
                Uncredited NIP transfers, POS tamper locks, webhook
                timeouts, KYC holds. DeskNG turns operational chaos
                into SLA-tracked tickets with clear owners and
                audit trails.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/login" className="btn-accent">
                  Start triaging
                </Link>
                <a href="#how" className="btn-ghost">
                  See how it works
                </a>
              </div>

              <p className="mt-6 text-xs text-ink-400">
                Postman-tested API · MongoDB · JWT auth · Demo
                accounts ready — password <code className="font-mono">
                  Password123!
                </code>
              </p>
            </div>

            <div className="relative">
              <div className="card p-5 shadow-card-hover">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-ink-900">
                    Operations Queue
                  </p>
                  <span
                    className={
                      "rounded-full bg-ink-50 px-2.5 " +
                      "py-0.5 text-xs font-medium text-ink-500"
                    }
                  >
                    live preview
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ["Open", "4", "bg-blue-500"],
                    ["Escalated", "2", "bg-rose-500"],
                    ["SLA breached", "8", "bg-red-600"],
                  ].map(([label, value, dot]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-ink-100 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                        <p
                          className={
                            "text-[10px] font-bold uppercase " +
                            "tracking-wide text-ink-400"
                          }
                        >
                          {label}
                        </p>
                      </div>
                      <p
                        className={
                          "mt-1 font-display text-xl font-bold " +
                          "tabular-nums text-ink-950"
                        }
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  {previewTickets.map((t) => (
                    <div
                      key={t.no}
                      className={
                        "flex items-center gap-3 rounded-xl " +
                        "border border-ink-100 px-3 py-2.5"
                      }
                    >
                      <p className="font-mono text-xs text-ink-400">
                        {t.no}
                      </p>
                      <div className="min-w-0 flex-1">
                        <p
                          className={
                            "truncate text-sm font-medium " +
                            "text-ink-900"
                          }
                        >
                          {t.sub}
                        </p>
                        <p className="text-xs text-ink-400">{t.meta}</p>
                      </div>
                      <span
                        className={
                          `rounded-full border px-2 py-0.5 ` +
                          `text-[10px] font-semibold ${t.tone}`
                        }
                      >
                        {t.meta.split(" · ")[2]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p
              className={
                "text-xs font-bold uppercase tracking-wider " +
                "text-ink-400"
              }
            >
              What DeskNG does
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-950">
              Built for desks that can't afford drift.
            </h2>
            <p className="mt-3 text-ink-500">
              Every rule maps to a hard invariant in the API — not
              a convention the team might forget.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className={
                  "group card p-6 transition hover:-translate-y-0.5 " +
                  "hover:shadow-card-hover"
                }
              >
                <div
                  className={
                    "flex h-10 w-10 items-center justify-center " +
                    "rounded-xl bg-ink-900 text-acid-400"
                  }
                >
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="mt-4 font-display font-bold text-ink-950">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <TestimonialTicker />

        <section id="how" className="bg-bg-dark">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-2xl">
              <p
                className={
                  "text-xs font-bold uppercase tracking-wider " +
                  "text-acid-400"
                }
              >
                How it works
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white">
                From chaos to closure in three steps.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="relative">
                  <p className="font-display text-5xl font-bold text-ink-700">
                    {s.n}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-bold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-300">
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p
              className={
                "text-xs font-bold uppercase tracking-wider " +
                "text-ink-400"
              }
            >
              Role-based access
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-950">
              One platform, scoped for every seat.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {roles.map((r) => (
              <div key={r.name} className={`card p-6 ${r.tone}`}>
                <h3 className="font-display text-lg font-bold text-ink-950">
                  {r.name}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-ink-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-ink-700">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-7xl px-6 pb-20">
          <div className="card overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="bg-bg-dark p-8">
                <p
                  className={
                    "text-xs font-bold uppercase tracking-wider " +
                    "text-acid-400"
                  }
                >
                  Live demo
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">
                  Walk in with a role.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-300">
                  All seeded accounts share the password{" "}
                  <code className="font-mono text-acid-400">
                    Password123!
                  </code>{" "}
                  Sign in and jump straight to the queue — no
                  setup required.
                </p>
                <div className="mt-6 space-y-2.5">
                  {credentials.map((c) => (
                    <div
                      key={c.role}
                      className={
                        "flex items-center justify-between rounded-xl " +
                        "border border-ink-700 bg-ink-800/60 px-4 py-3"
                      }
                    >
                      <span className="text-sm font-semibold text-white">
                        {c.role}
                      </span>
                      <span className="font-mono text-xs text-ink-300">
                        {c.email}
                      </span>
                    </div>
                  ))}
                </div>
                <Link to="/login" className="btn-accent mt-6">
                  Open login page
                </Link>
              </div>

              <div className="flex flex-col justify-center gap-4 p-8">
                <p className="text-sm text-ink-500">
                  The evaluator path: register as a customer, raise
                  a ticket, log out — then sign in as an agent to
                  see it land in the queue.
                </p>
                <ol className="space-y-3">
                  {[
                    "Create an account or use a demo role",
                    "Raise a classified ticket with an SLA preview",
                    "Watch it flow into the operations queue",
                    "Reply, escalate, assign, and close",
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span
                        className={
                          "flex h-6 w-6 shrink-0 items-center " +
                          "justify-center rounded-full bg-ink-900 text-xs " +
                          "font-bold text-acid-400"
                        }
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-ink-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-100">
        <div
          className={
            "mx-auto flex max-w-7xl flex-col items-center justify-between " +
            "gap-4 px-6 py-8 sm:flex-row"
          }
        >
          <div className="flex items-center gap-2">
            <span
              className={
                "flex h-7 w-7 items-center justify-center " +
                "rounded-lg bg-acid-400 font-display text-sm font-bold " +
                "text-ink-950"
              }
            >
              D
            </span>
            <span className="font-display font-bold text-ink-950">
              DeskNG
            </span>
          </div>
          <p className="text-sm text-ink-400">
            Merchant & customer support, on a clock.
          </p>
          <p className="text-xs text-ink-400">
            © 2026 DeskNG · Capstone MVP
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
