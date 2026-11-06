import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials } from "./ui";

const roleLabels = {
  admin: "Admin",
  agent: "Agent",
  customer: "Customer",
};

export const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-bg-dark">
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
                "bg-acid-400 font-display text-lg font-bold text-ink-950"
              }
            >
              D
            </span>
            <span className="font-display text-lg font-bold text-white">
              Desk<span className="text-acid-400">NG</span>
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-3">
              <span
                className={
                  "flex h-9 w-9 items-center justify-center rounded-full " +
                  "bg-ink-700 text-xs font-bold text-white"
                }
              >
                {initials(user.name)}
              </span>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-white">
                  {user.name}
                </p>
                <p className="text-xs text-ink-300">
                  {roleLabels[user.role] || user.role}
                </p>
              </div>
              <button
                onClick={onLogout}
                className={
                  "rounded-lg border border-ink-600 px-3 py-1.5 " +
                  "text-xs font-semibold text-ink-200 transition " +
                  "hover:bg-ink-800"
                }
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>

      <footer className="px-6 pb-8">
        <p className="mx-auto max-w-7xl text-center text-xs text-ink-400">
          DeskNG · Merchant & customer support operations
        </p>
      </footer>
    </div>
  );
};
