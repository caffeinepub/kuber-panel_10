import {
  Activity,
  ArrowDownCircle,
  Building2,
  CheckSquare,
  ChevronLeft,
  Code2,
  Coins,
  FileText,
  Gamepad2,
  HelpCircle,
  History,
  KeyRound,
  LayoutDashboard,
  Link,
  LogOut,
  Mail,
  MoreVertical,
  Shield,
  Shuffle,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import ActivationPanel from "./sections/ActivationPanel";
import AddBankAccount from "./sections/AddBankAccount";
import BankStatement from "./sections/BankStatement";
import DashboardHome from "./sections/DashboardHome";
import FundSection from "./sections/FundSection";
import HelpSupport from "./sections/HelpSupport";
import LiveFundActivity from "./sections/LiveFundActivity";
import MyCommission from "./sections/MyCommission";
import WithdrawalHistory from "./sections/WithdrawalHistory";
import WithdrawalSection from "./sections/WithdrawalSection";
import BankApproval from "./sections/admin/BankApproval";
import ChangeSupportLink from "./sections/admin/ChangeSupportLink";
import GeneratedCode from "./sections/admin/GeneratedCode";
import UserManagement from "./sections/admin/UserManagement";

// Module-level: track which logo works (prevents re-testing on every render)
let _cachedLogoSrc: string | null = null;
let _logoFailed = false;
const LOGO1 = "/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png";
const LOGO2 = "/assets/uploads/IMG_20260311_153614_686-removebg-preview-2.png";

(() => {
  const a = new window.Image();
  a.src = LOGO1;
  const b = new window.Image();
  b.src = LOGO2;
})();

const userMenuItems = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "add-bank", label: "Add Bank Account", Icon: Building2 },
  { id: "bank-statement", label: "Bank Statement", Icon: FileText },
  { id: "gaming-fund", label: "Gaming Fund (15%)", Icon: Gamepad2 },
  { id: "stock-fund", label: "Stock Fund (30%)", Icon: TrendingUp },
  { id: "mix-fund", label: "Mix Fund (30%)", Icon: Shuffle },
  { id: "political-fund", label: "Political Fund (25%)", Icon: Vote },
  { id: "live-activity", label: "Live Fund Activity", Icon: Activity },
  { id: "commission", label: "My Commission", Icon: Coins },
  { id: "withdrawal", label: "Withdrawal", Icon: ArrowDownCircle },
  { id: "withdrawal-history", label: "Withdrawal History", Icon: History },
  { id: "activation", label: "Activation Panel", Icon: KeyRound },
  { id: "help-support", label: "Help Support", Icon: HelpCircle },
];

const adminMenuItems = [
  { id: "generated-code", label: "Generated Codes", Icon: Code2 },
  { id: "user-management", label: "User Management", Icon: Users },
  { id: "bank-approval", label: "Bank Approval", Icon: CheckSquare },
  { id: "change-support", label: "Change Support Link", Icon: Link },
];

function renderSectionContent(activeSection: string) {
  switch (activeSection) {
    case "add-bank":
      return <AddBankAccount />;
    case "bank-statement":
      return <BankStatement />;
    case "gaming-fund":
      return <FundSection fundType="gaming" commission={15} />;
    case "stock-fund":
      return <FundSection fundType="stock" commission={30} />;
    case "mix-fund":
      return <FundSection fundType="mix" commission={30} />;
    case "political-fund":
      return <FundSection fundType="political" commission={25} />;
    case "live-activity":
      return <LiveFundActivity />;
    case "commission":
      return <MyCommission />;
    case "withdrawal":
      return <WithdrawalSection />;
    case "withdrawal-history":
      return <WithdrawalHistory />;
    case "activation":
      return <ActivationPanel />;
    case "help-support":
      return <HelpSupport />;
    case "generated-code":
      return <GeneratedCode />;
    case "user-management":
      return <UserManagement />;
    case "bank-approval":
      return <BankApproval />;
    case "change-support":
      return <ChangeSupportLink />;
    default:
      return null;
  }
}

function WelcomePopup({ onClose }: { onClose: () => void }) {
  const [logoSrc, setLogoSrc] = useState(_cachedLogoSrc || LOGO1);
  const [logoFailed, setLogoFailed] = useState(_logoFailed);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"), 2400);
    const t3 = setTimeout(onClose, 2900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onClose]);
  const visible = phase !== "out";
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{
        background: "#000000",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.45s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="flex flex-col items-center"
        style={{
          transform: phase === "in" ? "scale(0.88)" : "scale(1)",
          opacity: phase === "in" ? 0 : 1,
          transition:
            "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
        }}
      >
        {!logoFailed ? (
          <img
            src={logoSrc}
            alt="Kuber Panel"
            loading="eager"
            onError={() => {
              if (logoSrc === LOGO1) {
                _cachedLogoSrc = LOGO2;
                setLogoSrc(LOGO2);
              } else {
                _logoFailed = true;
                _cachedLogoSrc = null;
                setLogoFailed(true);
              }
            }}
            style={{
              width: 120,
              height: 120,
              objectFit: "contain",
              filter: "drop-shadow(0 0 28px rgba(212,160,23,0.7))",
            }}
          />
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#d4a017,#f0c040)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 900,
              color: "#000",
            }}
          >
            K
          </div>
        )}
        <div
          className="text-2xl font-black tracking-[0.22em] mt-5 mb-1"
          style={{
            background: "linear-gradient(135deg,#f0c040,#d4a017,#f0c040)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          KUBER PANEL
        </div>
        <div className="text-xs text-gray-400 tracking-widest mb-5">
          Official &amp; Licensed Platform
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
                animation: `bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmailRegistrationModal() {
  const { registerEmail } = useApp();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      await registerEmail(trimmed);
      toast.success("Account registered successfully!");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[998] flex items-center justify-center px-4"
      style={{ background: "#000000" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img
              src={LOGO1}
              alt="KUBER PANEL"
              loading="eager"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = LOGO2;
              }}
              style={{
                width: 80,
                height: 80,
                objectFit: "contain",
                filter: "drop-shadow(0 0 16px rgba(212,160,23,0.5))",
              }}
            />
          </div>
          <h1
            className="text-2xl font-black tracking-[0.18em] mb-1"
            style={{
              background:
                "linear-gradient(135deg,oklch(0.88 0.16 85),oklch(0.72 0.12 85))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            KUBER PANEL
          </h1>
          <p className="text-xs text-gray-500">
            Register your email to complete setup
          </p>
        </div>
        <div
          className="rounded-2xl p-6"
          style={{
            background: "oklch(0.08 0.008 220)",
            border: "1px solid oklch(0.65 0.15 220 / 30%)",
            boxShadow: "0 24px 64px oklch(0 0 0 / 60%)",
          }}
        >
          <div
            className="h-[2px] w-full mb-5"
            style={{
              background:
                "linear-gradient(90deg,transparent,oklch(0.75 0.17 85),transparent)",
              marginTop: -24,
              marginLeft: -24,
              width: "calc(100% + 48px)",
            }}
          />
          <h2 className="text-base font-bold text-white mb-1">
            Register Your Email
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Your email is required for account identification and admin
            management.
          </p>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Email Address
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                placeholder="yourname@gmail.com"
                data-ocid="register.input"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-700 outline-none"
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
            {error && (
              <div
                className="text-xs px-3 py-2 rounded-lg"
                style={{
                  background: "oklch(0.5 0.2 25 / 15%)",
                  border: "1px solid oklch(0.5 0.2 25 / 30%)",
                  color: "oklch(0.72 0.18 25)",
                }}
              >
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              data-ocid="register.submit_button"
              className="w-full py-3 rounded-xl font-bold text-black tracking-widest text-xs transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg,oklch(0.85 0.18 85),oklch(0.68 0.14 85))",
                boxShadow: "0 4px 20px oklch(0.75 0.17 85 / 25%)",
              }}
            >
              {loading ? "REGISTERING..." : "COMPLETE REGISTRATION"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const {
    activeSection,
    setActiveSection,
    isAdmin,
    isActivated,
    userActivation,
    needsEmailRegistration,
    userEmail,
    logout,
  } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const loginId =
    userEmail ||
    localStorage.getItem("kuber_admin_fallback_email") ||
    localStorage.getItem("kuber_user_email") ||
    "Kuber User";

  const welcomeKey = `kuber_welcomed_${loginId}`;
  const [showWelcome, setShowWelcome] = useState(() => {
    if (localStorage.getItem(welcomeKey)) return false;
    localStorage.setItem(welcomeKey, "1");
    return true;
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isOnDashboard = activeSection === "dashboard";
  const allMenuItems = [...userMenuItems, ...(isAdmin ? adminMenuItems : [])];
  const currentItem = allMenuItems.find((m) => m.id === activeSection);
  const currentLabel = currentItem?.label || "Dashboard";
  const CurrentIcon = currentItem?.Icon;

  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    () => localStorage.getItem(`kuber_profile_photo_${loginId}`) || null,
  );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      localStorage.setItem(`kuber_profile_photo_${loginId}`, dataUrl);
      setProfilePhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const wasDeactivatedByAdmin =
    !isAdmin && userActivation?.deactivatedByAdmin === true;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(welcomeKey);
    logout();
  };

  // Show email registration modal if needed
  if (needsEmailRegistration) {
    return <EmailRegistrationModal />;
  }

  return (
    <div className="official-panel flex flex-col h-screen overflow-hidden">
      {showWelcome && <WelcomePopup onClose={() => setShowWelcome(false)} />}

      {wasDeactivatedByAdmin && (
        <div
          className="fixed top-0 left-0 right-0 z-[998] px-4 py-2 text-center text-xs font-bold"
          style={{ background: "oklch(0.5 0.2 25)", color: "white" }}
        >
          Your account has been deactivated by admin. Contact admin for
          re-activation code.
        </div>
      )}

      <div className="gold-top-stripe fixed top-0 left-0 right-0 z-50" />

      {/* Top bar */}
      <div
        className="sticky top-[3px] z-30 flex items-center justify-between px-4 py-3 flex-shrink-0 relative"
        style={{
          background: "oklch(0.08 0.005 220 / 97%)",
          borderBottom: "1px solid oklch(0.65 0.2 220 / 15%)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          {!isOnDashboard ? (
            <button
              type="button"
              data-ocid="header.back_button"
              onClick={() => setActiveSection("dashboard" as any)}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                background: "oklch(0.65 0.2 220 / 10%)",
                border: "1px solid oklch(0.65 0.2 220 / 25%)",
                color: "oklch(0.75 0.18 220)",
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                data-ocid="header.menu_button"
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: menuOpen
                    ? "oklch(0.65 0.2 220 / 18%)"
                    : "oklch(0.65 0.2 220 / 8%)",
                  border: "1px solid oklch(0.65 0.2 220 / 25%)",
                  color: "oklch(0.75 0.18 220)",
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div
                  className="absolute left-0 top-full mt-2 z-50 overflow-hidden"
                  style={{
                    width: "240px",
                    background: "oklch(0.09 0.01 220)",
                    border: "1px solid oklch(0.65 0.2 220 / 25%)",
                    borderRadius: "12px",
                    boxShadow: "0 16px 48px oklch(0 0 0 / 70%)",
                  }}
                >
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{
                      borderBottom: "1px solid oklch(0.65 0.2 220 / 15%)",
                      background: "oklch(0.08 0.005 220)",
                    }}
                  >
                    <img
                      src={LOGO1}
                      alt="Kuber Panel"
                      className="w-7 h-7 flex-shrink-0"
                      loading="eager"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = LOGO2;
                      }}
                    />
                    <div>
                      <div className="font-black text-xs tracking-widest shimmer-text">
                        KUBER PANEL
                      </div>
                      <div
                        className="text-[9px] tracking-[0.12em] uppercase"
                        style={{ color: "oklch(0.65 0.2 220 / 55%)" }}
                      >
                        {isAdmin ? "Access Menu" : "User Menu"}
                      </div>
                    </div>
                  </div>
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: "60vh" }}
                  >
                    <div
                      className="px-4 pt-3 pb-1 text-[9px] uppercase tracking-[0.15em] font-semibold"
                      style={{ color: "oklch(0.65 0.2 220 / 50%)" }}
                    >
                      Main Menu
                    </div>
                    {userMenuItems.map(({ id, label, Icon }) => (
                      <button
                        type="button"
                        key={id}
                        onClick={() => {
                          setActiveSection(id as any);
                          setMenuOpen(false);
                        }}
                        data-ocid={`nav.${id.replace(/-/g, "_")}.link`}
                        className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150"
                        style={{
                          background:
                            activeSection === id
                              ? "oklch(0.65 0.2 220 / 12%)"
                              : "transparent",
                          color:
                            activeSection === id
                              ? "oklch(0.85 0.18 220)"
                              : "oklch(0.65 0.05 220)",
                          borderLeft:
                            activeSection === id
                              ? "3px solid oklch(0.65 0.2 220)"
                              : "3px solid transparent",
                        }}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium text-left flex-1">
                          {label}
                        </span>
                      </button>
                    ))}
                    {isAdmin && (
                      <>
                        <div
                          className="px-4 pt-3 pb-1 text-[9px] uppercase tracking-[0.15em] font-semibold"
                          style={{ color: "oklch(0.62 0.2 145 / 80%)" }}
                        >
                          ⚙ Management
                        </div>
                        {adminMenuItems.map(({ id, label, Icon }) => (
                          <button
                            type="button"
                            key={id}
                            onClick={() => {
                              setActiveSection(id as any);
                              setMenuOpen(false);
                            }}
                            data-ocid={`nav.${id.replace(/-/g, "_")}.link`}
                            className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-150"
                            style={{
                              background:
                                activeSection === id
                                  ? "oklch(0.65 0.2 220 / 12%)"
                                  : "transparent",
                              color:
                                activeSection === id
                                  ? "oklch(0.85 0.18 220)"
                                  : "oklch(0.65 0.05 220)",
                              borderLeft:
                                activeSection === id
                                  ? "3px solid oklch(0.65 0.2 220)"
                                  : "3px solid transparent",
                            }}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-medium text-left flex-1">
                              {label}
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                    <div
                      style={{
                        borderTop: "1px solid oklch(0.65 0.2 220 / 15%)",
                        margin: "8px 0 0",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        data-ocid="sidebar.logout_button"
                        className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150"
                        style={{ color: "oklch(0.6 0.18 25)" }}
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                  <div
                    className="mx-3 mb-3 mt-1 px-3 py-2 rounded-lg flex items-center gap-2"
                    style={{
                      background: "oklch(0.65 0.2 220 / 8%)",
                      border: "1px solid oklch(0.65 0.2 220 / 20%)",
                    }}
                  >
                    <Shield className="w-3 h-3 gold-text flex-shrink-0" />
                    <div className="text-[9px] font-bold tracking-[0.1em] uppercase gold-text">
                      Licensed &amp; Secured
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {!isOnDashboard && CurrentIcon && (
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "oklch(0.65 0.2 220 / 15%)",
                  border: "1px solid oklch(0.65 0.2 220 / 30%)",
                }}
              >
                <CurrentIcon className="w-3.5 h-3.5 gold-text" />
              </div>
              <span className="text-sm font-bold text-white">
                {currentLabel}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: isActivated
                  ? "oklch(0.62 0.2 145 / 12%)"
                  : "oklch(0.5 0.2 25 / 12%)",
                border: isActivated
                  ? "1px solid oklch(0.62 0.2 145 / 30%)"
                  : "1px solid oklch(0.5 0.2 25 / 30%)",
              }}
            >
              <span
                className="text-[10px] font-bold tracking-wider"
                style={{
                  color: isActivated
                    ? "oklch(0.72 0.18 145)"
                    : "oklch(0.65 0.2 25)",
                }}
              >
                {isActivated ? "✓ ACTIVE" : "NOT ACTIVATED"}
              </span>
            </div>
          )}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              data-ocid="header.user_button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1 rounded-xl transition-all duration-200"
              style={{
                background: profileOpen
                  ? "oklch(0.65 0.2 220 / 12%)"
                  : "transparent",
                border: profileOpen
                  ? "1px solid oklch(0.65 0.2 220 / 25%)"
                  : "1px solid transparent",
              }}
            >
              <div className="text-right hidden sm:block">
                <div className="text-[10px] gold-text font-bold tracking-wider">
                  {isAdmin ? "● ADMIN" : "● USER"}
                </div>
                <div className="text-[10px] text-gray-500 truncate max-w-28">
                  {loginId.length > 16 ? `${loginId.slice(0, 16)}…` : loginId}
                </div>
              </div>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  style={{ border: "1px solid oklch(0.65 0.2 220 / 40%)" }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center gold-glow flex-shrink-0"
                  style={{
                    background: "oklch(0.65 0.2 220 / 15%)",
                    border: "1px solid oklch(0.65 0.2 220 / 40%)",
                  }}
                >
                  <span className="text-xs gold-text font-bold">
                    {isAdmin ? "A" : loginId.slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
            </button>
            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 z-50"
                data-ocid="header.user.panel"
                style={{
                  width: "240px",
                  background: "oklch(0.09 0.01 220)",
                  border: "1px solid oklch(0.65 0.2 220 / 25%)",
                  borderRadius: "14px",
                  boxShadow: "0 16px 48px oklch(0 0 0 / 70%)",
                }}
              >
                <div
                  className="px-4 py-4 flex flex-col items-center text-center"
                  style={{
                    borderBottom: "1px solid oklch(0.65 0.2 220 / 15%)",
                    background: "oklch(0.08 0.005 220)",
                    borderRadius: "14px 14px 0 0",
                  }}
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-14 h-14 rounded-full object-cover mb-3"
                      style={{ border: "2px solid oklch(0.75 0.17 85 / 40%)" }}
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-3 gold-glow"
                      style={{
                        background:
                          "linear-gradient(135deg,oklch(0.65 0.2 220 / 30%),oklch(0.75 0.17 85 / 20%))",
                        border: "2px solid oklch(0.75 0.17 85 / 40%)",
                      }}
                    >
                      <span className="text-2xl font-black gold-text">
                        {isAdmin ? "A" : loginId.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <label
                    className="cursor-pointer mt-1 mb-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
                    style={{
                      background: "oklch(0.65 0.2 220 / 12%)",
                      border: "1px solid oklch(0.65 0.2 220 / 30%)",
                      color: "oklch(0.75 0.18 220)",
                    }}
                    data-ocid="profile.upload_button"
                  >
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                  <div
                    className="px-3 py-0.5 rounded-full mb-2 text-[10px] font-bold tracking-widest"
                    style={{
                      background: isAdmin
                        ? "oklch(0.62 0.2 145 / 15%)"
                        : "oklch(0.65 0.2 220 / 15%)",
                      border: isAdmin
                        ? "1px solid oklch(0.62 0.2 145 / 40%)"
                        : "1px solid oklch(0.65 0.2 220 / 40%)",
                      color: isAdmin
                        ? "oklch(0.72 0.18 145)"
                        : "oklch(0.75 0.18 220)",
                    }}
                  >
                    {isAdmin ? "ADMIN" : "USER"}
                  </div>
                  {!isAdmin && (
                    <div
                      className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                      style={{
                        background: isActivated
                          ? "oklch(0.62 0.2 145 / 12%)"
                          : "oklch(0.5 0.2 25 / 12%)",
                        color: isActivated
                          ? "oklch(0.72 0.2 145)"
                          : "oklch(0.65 0.2 25)",
                      }}
                    >
                      {isActivated ? "Panel Active" : "Panel Not Activated"}
                    </div>
                  )}
                </div>
                <div className="px-4 py-3">
                  <div
                    className="text-[9px] uppercase tracking-[0.15em] mb-1 font-semibold"
                    style={{ color: "oklch(0.65 0.2 220 / 55%)" }}
                  >
                    Login ID
                  </div>
                  <div
                    className="text-sm font-medium text-white break-all"
                    data-ocid="header.user.login_id"
                  >
                    {loginId}
                  </div>
                </div>
                <div
                  className="px-3 pb-3"
                  style={{ borderTop: "1px solid oklch(0.65 0.2 220 / 12%)" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    data-ocid="header.logout_button"
                    className="w-full flex items-center justify-center gap-2 mt-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: "oklch(0.5 0.2 25 / 12%)",
                      border: "1px solid oklch(0.5 0.2 25 / 30%)",
                      color: "oklch(0.7 0.18 25)",
                    }}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {isOnDashboard ? (
          <div className="p-4">
            <DashboardHome />
          </div>
        ) : (
          <div className="p-4">{renderSectionContent(activeSection)}</div>
        )}
        {isOnDashboard && (
          <footer
            className="px-6 py-3 text-center"
            style={{ borderTop: "1px solid oklch(0.65 0.2 220 / 10%)" }}
          >
            <p className="text-[10px] text-gray-600">
              &copy; {new Date().getFullYear()} KUBER PANEL &middot; Licensed
              Financial Dashboard
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}
