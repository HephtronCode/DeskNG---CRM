import { Link } from "react-router-dom";

const bullets = [
  "SLA clocks on every classified ticket",
  "Five-state lifecycle with audit stamps",
  "Role-scoped queues and internal notes",
];

const AuthLayout = ({ children }) => (
  <div className="grid min-h-screen bg-paper lg:grid-cols-2">
    <aside className="relative hidden overflow-hidden bg-bg-dark lg:block">
      <div className="grid-dark absolute inset-0" />
      <div
        className={
          "glow-acid pointer-events-none absolute -bottom-24 " +
          "-left-24 h-96 w-96 rounded-full"
        }
      />

      <div className="relative flex h-full flex-col justify-between p-10">
        <Link to="/" className="flex items-center gap-2">
          <span
            className={
              "flex h-9 w-9 items-center justify-center rounded-lg " +
              "bg-acid-400 font-display text-xl font-bold text-ink-950"
            }
          >
            D
          </span>
          <span className="font-display text-xl font-bold text-white">
            Desk<span className="text-acid-400">NG</span>
          </span>
        </Link>

        <div>
          <h1
            className={
              "max-w-md font-display text-3xl font-bold " +
              "leading-tight text-white"
            }
          >
            The ops desk that keeps everything on the clock.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-300">
            Uncredited transfers, tamper locks, webhook timeouts,
            KYC holds — structured, SLA-tracked, and accounted for.
          </p>

          <ul className="mt-8 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <span
                  className={
                    "flex h-6 w-6 items-center justify-center " +
                    "rounded-full bg-acid-400 text-ink-950"
                  }
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm text-white">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-ink-500">
          Capstone MVP · Topic #37 — Customer Support Ticketing
        </p>
      </div>
    </aside>

    <main className="flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">{children}</div>
    </main>
  </div>
);

export default AuthLayout;
