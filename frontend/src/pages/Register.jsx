import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { ErrorBanner } from "../components/ui";

const ruleChecks = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /[0-9]/.test(p) },
  { label: "Special character", test: (p) => /[\W_]/.test(p) },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rulesMet = ruleChecks.map((r) => r.test(password));
  const allRulesMet = rulesMet.every(Boolean);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allRulesMet) {
      setError("Password does not meet all requirements");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        department: department || undefined,
      });
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
        Get started
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink-950">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Register to raise classified support tickets.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error && <ErrorBanner message={error} />}

        <div>
          <label className="label-field" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Amina Bello"
            className="input-field mt-1.5"
          />
        </div>

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
          <label className="label-field" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="input-field mt-1.5"
          />

          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {ruleChecks.map((r, i) => (
              <li
                key={r.label}
                className={
                  "flex items-center gap-1.5 text-xs " +
                  (rulesMet[i]
                    ? "text-emerald-600"
                    : "text-ink-400")
                }
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {rulesMet[i] ? (
                    <path d="M5 13l4 4L19 7" />
                  ) : (
                    <circle cx="12" cy="12" r="9" />
                  )}
                </svg>
                {r.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="label-field" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            className="input-field mt-1.5"
          />
        </div>

        <div>
          <label className="label-field" htmlFor="department">
            Department (optional)
          </label>
          <input
            id="department"
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Finance & Treasury"
            className="input-field mt-1.5"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-ink-950 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
