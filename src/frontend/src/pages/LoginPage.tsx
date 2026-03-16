import { Lock, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "oklch(0.05 0 0)" }}
    >
      {/* Background grid effect */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.75 0.15 85) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0.15 85) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png"
            alt="Kuber Panel Logo"
            className="w-28 h-28 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-3xl font-black tracking-widest gold-text">
            KUBER PANEL
          </h1>
          <p className="text-gray-400 text-sm mt-1 tracking-wider">
            FINANCIAL MANAGEMENT SYSTEM
          </p>
          <div
            className="flex items-center justify-center gap-2 mt-3 px-4 py-1.5 rounded-full mx-auto w-fit"
            style={{
              background: "oklch(0.75 0.15 85 / 10%)",
              border: "1px solid oklch(0.75 0.15 85 / 30%)",
            }}
          >
            <Shield className="w-3.5 h-3.5 gold-text" />
            <span className="text-xs gold-text font-medium tracking-wider">
              OFFICIAL &amp; LICENSED PLATFORM
            </span>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "oklch(0.09 0 0)",
            border: "1px solid oklch(0.75 0.15 85 / 30%)",
          }}
        >
          {/* Tabs */}
          <div
            className="flex rounded-lg p-1 mb-6"
            style={{ background: "oklch(0.06 0 0)" }}
          >
            <button
              type="button"
              onClick={() => setTab("login")}
              data-ocid="auth.login_tab"
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                tab === "login"
                  ? "gold-gradient text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              data-ocid="auth.register_tab"
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                tab === "register"
                  ? "gold-gradient text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              REGISTER
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
                Gmail ID
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Gmail ID"
                  data-ocid="login.input"
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{
                    background: "oklch(0.13 0 0)",
                    border: "1px solid oklch(0.75 0.15 85 / 20%)",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
                Password
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  data-ocid="login.password_input"
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
                  style={{
                    background: "oklch(0.13 0 0)",
                    border: "1px solid oklch(0.75 0.15 85 / 20%)",
                  }}
                />
              </div>
            </div>

            {tab === "register" && (
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Confirm Password
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    data-ocid="register.input"
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
                    style={{
                      background: "oklch(0.13 0 0)",
                      border: "1px solid oklch(0.75 0.15 85 / 20%)",
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid={
                tab === "login"
                  ? "login.submit_button"
                  : "register.submit_button"
              }
              className="w-full py-3 rounded-lg font-bold text-black tracking-wider transition-all hover:opacity-90 disabled:opacity-50 mt-2 text-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.8 0.17 85), oklch(0.65 0.13 85))",
              }}
            >
              {isLoggingIn
                ? "AUTHENTICATING..."
                : tab === "login"
                  ? "LOGIN TO KUBER PANEL"
                  : "CREATE ACCOUNT"}
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-4">
            Secured by Internet Identity • Decentralized Authentication
          </p>
        </div>

        <p className="text-center text-xs text-gray-700 mt-4">
          © 2024 KUBER PANEL. All rights reserved.
        </p>
      </div>
    </div>
  );
}
