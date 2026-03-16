import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import * as LocalStore from "../utils/LocalStore";

const ADMIN_EMAIL = "kuberpanelwork@gmail.com";
const ADMIN_PASSWORD = "Admin@123";
const LOGO1 = "/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png";
const LOGO2 = "/assets/uploads/IMG_20260311_153614_686-removebg-preview-2.png";

// Eagerly preload logos
(() => {
  const a = new window.Image();
  a.src = LOGO1;
  const b = new window.Image();
  b.src = LOGO2;
})();

interface LoginPageProps {
  onLogin: () => void;
}

function KuberLogo({ size = 90 }: { size?: number }) {
  const [src, setSrc] = useState(LOGO1);
  const [failed, setFailed] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
      }}
    >
      {!failed ? (
        <img
          src={src}
          alt="KUBER PANEL"
          loading="eager"
          onError={() => {
            if (src === LOGO1) setSrc(LOGO2);
            else setFailed(true);
          }}
          style={{
            display: "block",
            width: size,
            height: size,
            objectFit: "contain",
            filter: "drop-shadow(0 0 18px rgba(212,160,23,0.55))",
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#d4a017,#f0c040)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.4,
            fontWeight: 900,
            color: "#000",
          }}
        >
          K
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: "0 0 32px 8px rgba(212,160,23,0.28)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function WelcomePopup({
  type,
  onClose,
}: { type: "login" | "register"; onClose: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 350);
    const t2 = setTimeout(() => setPhase("out"), 2400);
    const t3 = setTimeout(onClose, 2850);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onClose]);
  const visible = phase !== "out";
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "#000000",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.45s ease",
      }}
      data-ocid="welcome.modal"
    >
      <div
        style={{
          transform: phase === "in" ? "scale(0.88)" : "scale(1)",
          opacity: phase === "in" ? 0 : 1,
          transition:
            "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <KuberLogo size={110} />
        <div
          className="text-2xl font-black tracking-[0.25em] mb-1 mt-6"
          style={{
            background: "linear-gradient(135deg,#f0c040,#d4a017,#f0c040)",
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
    </div>
  );
}

const inputFocusBorder = "1px solid oklch(0.65 0.2 220 / 55%)";
const inputBlurBorder = "1px solid oklch(0.65 0.15 220 / 20%)";

interface KuberUser {
  email: string;
  password: string;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<"login" | "register">("login");

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = inputFocusBorder;
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = inputBlurBorder;
  };

  const handleLogin = async () => {
    setError("");
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);

    // Admin check
    if (trimEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("kuber_admin_fallback", "true");
      localStorage.setItem("kuber_admin_fallback_email", trimEmail);
      localStorage.setItem("kuber_user_email", trimEmail);
      localStorage.setItem("kuber_logged_in_user", trimEmail);
      setPopupType("login");
      setShowPopup(true);
      return;
    }

    // Regular user check
    const stored = localStorage.getItem("kuber_users");
    const users: KuberUser[] = stored ? JSON.parse(stored) : [];
    const found = users.find(
      (u) => u.email.toLowerCase() === trimEmail && u.password === password,
    );
    if (!found) {
      setError("Invalid email or password");
      return;
    }
    localStorage.setItem("kuber_user_email", trimEmail);
    localStorage.setItem("kuber_logged_in_user", trimEmail);
    setPopupType("login");
    setShowPopup(true);
  };

  const handleRegister = async () => {
    setError("");
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (trimEmail === ADMIN_EMAIL) {
      setError("This email cannot be used for registration");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);

    const stored = localStorage.getItem("kuber_users");
    const users: KuberUser[] = stored ? JSON.parse(stored) : [];
    const exists = users.find((u) => u.email.toLowerCase() === trimEmail);
    if (exists) {
      setError("An account with this email already exists");
      return;
    }
    users.push({ email: trimEmail, password });
    localStorage.setItem("kuber_users", JSON.stringify(users));
    // Also save to kuber_registered_users for UserManagement compatibility
    LocalStore.saveRegisteredUser(trimEmail, password);
    localStorage.setItem("kuber_user_email", trimEmail);
    localStorage.setItem("kuber_logged_in_user", trimEmail);
    setPopupType("register");
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    onLogin();
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
            <div className="flex justify-center mb-4">
              <KuberLogo size={88} />
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

            {/* Tabs */}
            <div
              className="flex"
              style={{ borderBottom: "1px solid oklch(0.65 0.15 220 / 20%)" }}
            >
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    setError("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  data-ocid={`auth.${t}.tab`}
                  className="flex-1 py-3 text-xs font-bold tracking-[0.15em] uppercase transition-all"
                  style={{
                    color:
                      tab === t ? "oklch(0.82 0.17 85)" : "oklch(0.5 0.03 220)",
                    borderBottom:
                      tab === t
                        ? "2px solid oklch(0.75 0.17 85)"
                        : "2px solid transparent",
                    background: "transparent",
                  }}
                >
                  {t === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {/* Email */}
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Login ID (Email)
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        tab === "login" ? handleLogin() : handleRegister();
                    }}
                    placeholder="Enter your email"
                    data-ocid="auth.email.input"
                    className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-700 outline-none transition-all"
                    style={{
                      background: "oklch(0.12 0.005 220)",
                      border: inputBlurBorder,
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Password
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          tab === "login" ? handleLogin() : handleRegister();
                      }}
                      placeholder="Enter password"
                      data-ocid="auth.password.input"
                      className="w-full px-4 py-2.5 pr-10 rounded-lg text-sm text-white placeholder-gray-700 outline-none transition-all"
                      style={{
                        background: "oklch(0.12 0.005 220)",
                        border: inputBlurBorder,
                      }}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (register only) */}
                {tab === "register" && (
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Confirm Password
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRegister();
                        }}
                        placeholder="Confirm your password"
                        data-ocid="auth.confirm_password.input"
                        className="w-full px-4 py-2.5 pr-10 rounded-lg text-sm text-white placeholder-gray-700 outline-none transition-all"
                        style={{
                          background: "oklch(0.12 0.005 220)",
                          border: inputBlurBorder,
                        }}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
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
                    data-ocid="auth.error_state"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={tab === "login" ? handleLogin : handleRegister}
                  disabled={loading}
                  data-ocid="auth.submit_button"
                  className="w-full py-3 rounded-xl font-bold text-black tracking-widest text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.85 0.18 85), oklch(0.68 0.14 85))",
                    boxShadow: "0 4px 20px oklch(0.75 0.17 85 / 25%)",
                  }}
                >
                  {loading
                    ? "PLEASE WAIT..."
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
