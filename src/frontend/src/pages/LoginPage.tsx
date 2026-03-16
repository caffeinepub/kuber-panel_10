import { Lock, Mail, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import * as LocalStore from "../utils/LocalStore";

const ADMIN_EMAIL = "kuberpanelwork@gmail.com";
const ADMIN_PASSWORD = "Admin@123";
const LOGO = "/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png";

interface LoginPageProps {
  onLogin: (email: string) => void;
}

function WelcomePopup({
  type,
  onClose,
}: {
  type: "login" | "register";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#000000" }}
      data-ocid="welcome.modal"
    >
      <img
        src="/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png"
        alt="Kuber Panel"
        style={{
          width: 130,
          height: 130,
          objectFit: "contain",
          filter: "drop-shadow(0 0 24px rgba(212,160,23,0.5))",
          marginBottom: 24,
        }}
      />
      <div
        className="text-2xl font-black tracking-[0.25em] mb-1"
        style={{
          background: "linear-gradient(135deg, #f0c040, #d4a017, #f0c040)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        KUBER PANEL
      </div>
      <div className="text-sm text-gray-400 mb-6">
        {type === "login"
          ? "Signing in securely..."
          : "Creating your account..."}
      </div>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#d4a017",
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <div
        className="mt-8 px-5 py-2 rounded-full flex items-center gap-2"
        style={{
          background: "rgba(22,163,74,0.12)",
          border: "1px solid rgba(22,163,74,0.3)",
        }}
      >
        <div
          className="w-2 h-2 rounded-full bg-green-500"
          style={{ animation: "pulse 1s ease-in-out infinite" }}
        />
        <span className="text-xs font-bold text-green-400">
          {type === "login" ? "LOGIN SUCCESSFUL" : "REGISTRATION SUCCESSFUL"}
        </span>
      </div>
    </div>
  );
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<"login" | "register">("login");
  const [pendingEmail, setPendingEmail] = useState("");

  const handlePopupClose = () => {
    setShowPopup(false);
    if (popupType === "login") {
      onLogin(pendingEmail);
    } else {
      setTab("login");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const handleSubmit = async () => {
    setError("");
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Gmail ID required");
      return;
    }
    if (!password) {
      setError("Password required");
      return;
    }
    if (tab === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Admin login
    if (trimmedEmail === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        setError("Invalid admin credentials");
        return;
      }
      setLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      setLoading(false);
      setPendingEmail(trimmedEmail);
      setPopupType("login");
      setShowPopup(true);
      return;
    }

    if (tab === "login") {
      const users = LocalStore.getRegisteredUsers();
      const found = users.find((u) => u.email.toLowerCase() === trimmedEmail);
      if (!found) {
        setError("Account not found. Please register first.");
        return;
      }
      if (found.password !== password) {
        setError("Incorrect password");
        return;
      }
    }

    if (tab === "register") {
      const existingUsers = LocalStore.getRegisteredUsers();
      if (existingUsers.find((u) => u.email.toLowerCase() === trimmedEmail)) {
        setError("An account with this email already exists. Please login.");
        return;
      }
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);

    if (tab === "register") {
      LocalStore.saveRegisteredUser(trimmedEmail, password);
      setPendingEmail(trimmedEmail);
      setPopupType("register");
      setShowPopup(true);
      return;
    }

    setPendingEmail(trimmedEmail);
    setPopupType("login");
    setShowPopup(true);
  };

  return (
    <>
      {showPopup && (
        <WelcomePopup type={popupType} onClose={handlePopupClose} />
      )}
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "oklch(0.04 0.01 240)" }}
      >
        <div
          className="fixed inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.7 0.15 220) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.15 220) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="gold-top-stripe fixed top-0 left-0 right-0 z-50" />

        <div className="relative w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="relative mx-auto mb-4 w-fit">
              <img
                src={LOGO}
                alt="Kuber Panel Logo"
                className="w-28 h-28 mx-auto drop-shadow-2xl"
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: "0 0 40px 10px oklch(0.75 0.17 85 / 35%)",
                  pointerEvents: "none",
                }}
              />
            </div>
            <h1
              className="text-3xl font-black tracking-[0.2em] mb-0.5"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.88 0.16 85), oklch(0.72 0.12 85), oklch(0.88 0.16 85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              KUBER PANEL
            </h1>
            <p className="text-gray-500 text-xs tracking-[0.18em] uppercase">
              Financial Management System
            </p>
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full"
              style={{
                background: "oklch(0.75 0.15 85 / 8%)",
                border: "1px solid oklch(0.75 0.15 85 / 30%)",
              }}
            >
              <Shield
                className="w-3 h-3"
                style={{ color: "oklch(0.75 0.15 85)" }}
              />
              <span
                className="text-[10px] font-bold tracking-[0.12em] uppercase"
                style={{ color: "oklch(0.75 0.15 85)" }}
              >
                OFFICIAL &amp; LICENSED PLATFORM
              </span>
            </div>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.08 0.008 220)",
              border: "1px solid oklch(0.65 0.15 220 / 30%)",
              boxShadow:
                "0 24px 64px oklch(0 0 0 / 60%), 0 0 0 1px oklch(0.75 0.15 85 / 10%)",
            }}
          >
            <div
              className="h-[2px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.75 0.17 85), transparent)",
              }}
            />
            <div className="p-6">
              <div
                className="flex rounded-xl p-1 mb-5"
                style={{ background: "oklch(0.05 0.005 220)" }}
              >
                {(["login", "register"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTab(t);
                      setError("");
                    }}
                    data-ocid={`auth.${t}_tab`}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg tracking-widest transition-all uppercase ${
                      tab === t
                        ? "text-black"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                    style={
                      tab === t
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.82 0.17 85), oklch(0.67 0.13 85))",
                          }
                        : {}
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <h2 className="text-base font-bold text-white">
                  {tab === "login" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  {tab === "login"
                    ? "Sign in to your Kuber Panel account"
                    : "Register to access Kuber Panel"}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Login ID (Email)
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="yourname@gmail.com"
                    data-ocid="login.input"
                    className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-700 outline-none transition-all"
                    style={{
                      background: "oklch(0.12 0.005 220)",
                      border: "1px solid oklch(0.65 0.15 220 / 20%)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border =
                        "1px solid oklch(0.65 0.2 220 / 55%)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border =
                        "1px solid oklch(0.65 0.15 220 / 20%)";
                    }}
                  />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Password
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Enter password"
                    data-ocid="login.password_input"
                    className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-700 outline-none transition-all"
                    style={{
                      background: "oklch(0.12 0.005 220)",
                      border: "1px solid oklch(0.65 0.15 220 / 20%)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border =
                        "1px solid oklch(0.65 0.2 220 / 55%)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border =
                        "1px solid oklch(0.65 0.15 220 / 20%)";
                    }}
                  />
                </div>
                {tab === "register" && (
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Confirm Password
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="Re-enter password"
                      data-ocid="register.input"
                      className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-700 outline-none transition-all"
                      style={{
                        background: "oklch(0.12 0.005 220)",
                        border: "1px solid oklch(0.65 0.15 220 / 20%)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border =
                          "1px solid oklch(0.65 0.2 220 / 55%)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border =
                          "1px solid oklch(0.65 0.15 220 / 20%)";
                      }}
                    />
                  </div>
                )}
                {error && (
                  <div
                    className="text-xs px-3 py-2 rounded-lg"
                    style={{
                      background: "oklch(0.5 0.2 25 / 15%)",
                      border: "1px solid oklch(0.5 0.2 25 / 30%)",
                      color: "oklch(0.72 0.18 25)",
                    }}
                    data-ocid="login.error_state"
                  >
                    {error}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  data-ocid={
                    tab === "login"
                      ? "login.submit_button"
                      : "register.submit_button"
                  }
                  className="w-full py-3 rounded-xl font-bold text-black tracking-widest text-xs transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-1"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.85 0.18 85), oklch(0.68 0.14 85))",
                    boxShadow: "0 4px 20px oklch(0.75 0.17 85 / 25%)",
                  }}
                >
                  {loading
                    ? "AUTHENTICATING..."
                    : tab === "login"
                      ? "LOGIN TO KUBER PANEL"
                      : "CREATE ACCOUNT"}
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3 text-gray-700" />
                <p className="text-center text-[10px] text-gray-700">
                  Official &amp; Licensed Platform
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-800 mt-4 tracking-wider">
            &copy; {new Date().getFullYear()} KUBER PANEL. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
