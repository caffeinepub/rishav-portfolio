import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const ADMIN_PASSWORD = "ffrishav9395889127";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!password) {
      setError("Please enter the password.");
      return;
    }
    setIsLoading(true);
    setError(null);

    // Small delay for UX
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("admin_auth", "1");
        navigate({ to: "/admin/dashboard" });
      } else {
        setError("Incorrect password. Please try again.");
        setIsLoading(false);
      }
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      data-ocid="admin_login.page"
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "oklch(0.06 0 0)" }}
    >
      {/* Background mesh */}
      <div className="hero-mesh-bg fixed inset-0" />

      {/* Grid */}
      <div
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.82 0.22 193) 1px, transparent 1px), linear-gradient(90deg, oklch(0.82 0.22 193) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 200,
          damping: 25,
        }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="glass-card rounded-3xl p-8 text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{
              background: "oklch(0.82 0.22 193 / 0.1)",
              border: "1px solid oklch(0.82 0.22 193 / 0.3)",
            }}
          >
            <Shield size={28} style={{ color: "var(--neon)" }} />
          </div>

          <h1
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              color: "oklch(0.95 0.01 240)",
            }}
          >
            Admin Panel
          </h1>
          <p className="text-sm mb-8" style={{ color: "oklch(0.5 0.02 240)" }}>
            Enter your password to access the dashboard
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl text-sm text-left"
              style={{
                background: "oklch(0.7 0.22 25 / 0.1)",
                border: "1px solid oklch(0.7 0.22 25 / 0.3)",
                color: "oklch(0.75 0.18 25)",
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Password input */}
          <div className="mb-4 text-left">
            <label className="flex flex-col gap-1.5">
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.55 0.02 240)" }}
              >
                Password
              </span>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock size={14} style={{ color: "oklch(0.5 0.02 240)" }} />
                </div>
                <input
                  data-ocid="admin_login.password_input"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: "oklch(0.08 0.004 240)",
                    border: "1px solid oklch(0.2 0.012 240)",
                    color: "oklch(0.88 0.01 240)",
                    caretColor: "var(--neon)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "oklch(0.82 0.22 193 / 0.5)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "oklch(0.2 0.012 240)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "oklch(0.5 0.02 240)" }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </label>
          </div>

          {/* Login button */}
          <button
            type="button"
            data-ocid="admin_login.submit_button"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60"
            style={{
              background: "oklch(0.82 0.22 193 / 0.12)",
              border: "1px solid oklch(0.82 0.22 193 / 0.4)",
              color: "var(--neon)",
            }}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Shield size={18} />
            )}
            {isLoading ? "Verifying..." : "Login"}
          </button>

          {/* Back link */}
          <a
            href="/"
            className="mt-6 inline-block text-xs transition-colors"
            style={{ color: "oklch(0.45 0.02 240)" }}
          >
            ← Back to Portfolio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
