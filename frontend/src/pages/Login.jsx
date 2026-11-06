import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { ErrorBanner, initials } from "../components/ui";

const demoAccounts = [
  { label: "Admin", email: "admin@desk.ng", dot: "bg-ink-800" },
  {
    label: "Agent",
    email: "chioma.okonkwo@desk.ng",
    dot: "bg-acid-400 text-ink-950",
  },
  {
    label: "Customer",
    email: "amina@konga-logistics.ng",
    dot: "bg-ink-100 text-ink-700",
  },
];

const DEMO_PASSWORD = "Password123!";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
        Welcome back
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink-950">
        Sign in to DeskNG
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Access the operations queue or raise a ticket.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {error && <ErrorBanner message={error} />}

        <div>
          <label className="label-field" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.ng"
            className="input-field mt-1.5"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label-field" htmlFor="password">
              Password
            </label>
            <span className="text-xs text-ink-400">
              min 8 characters
            </span>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field mt-1.5"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-sm text-ink-500">
          No account?{" "}
          <Link
            to="/register"
            className="font-semibold text-ink-950 hover:underline"
          >
            Register
          </Link>
        </p>
      </form>

      <div className="mt-8">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-ink-100" />
          <p
            className={
              "text-xs font-semibold uppercase tracking-wider " +
              "text-ink-400"
            }
          >
            Quick-fill demo roles
          </p>
          <span className="h-px flex-1 bg-ink-100" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {demoAccounts.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => fillDemo(a.email)}
              className={
                "group rounded-xl border border-ink-200 bg-white px-2 " +
                "py-3 text-center transition hover:border-ink-400 " +
                "hover:shadow-card"
              }
            >
              <span
                className={
                  "mx-auto flex h-8 w-8 items-center justify-center " +
                  "rounded-full text-xs font-bold " + a.dot
                }
              >
                {initials(a.label)}
              </span>
              <span
                className={
                  "mt-1.5 block text-sm font-semibold " +
                  "text-ink-900"
                }
              >
                {a.label}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-ink-400">
          Password for all demos:{" "}
          <code className="font-mono">Password123!</code>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
