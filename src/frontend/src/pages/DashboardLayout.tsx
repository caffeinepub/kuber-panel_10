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
  MoreVertical,
  Shield,
  Shuffle,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

const LOGO = "/assets/uploads/IMG_20260311_153614_686-removebg-preview-2.png";

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
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 2800);
    const t2 = setTimeout(onClose, 3300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{
        background: "oklch(0 0 0 / 88%)",
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      <div
        className="text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.9)",
          transition: "all 0.5s ease",
        }}
      >
        <img
          src={LOGO}
          alt="Kuber Panel"
          style={{
            width: 130,
            height: 130,
            margin: "0 auto 20px",
            filter: "drop-shadow(0 0 24px oklch(0.82 0.17 85 / 70%))",
          }}
        />
        <div
          className="text-3xl font-black tracking-[0.2em] mb-1"
          style={{ color: "oklch(0.88 0.16 85)" }}
        >
          KUBER PANEL
        </div>
        <div className="text-sm text-gray-400 tracking-widest">
          Official &amp; Licensed Platform
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
    logout,
  } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    if (sessionStorage.getItem("kuber_welcomed")) return false;
    sessionStorage.setItem("kuber_welcomed", "1");
    return true;
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isOnDashboard = activeSection === "dashboard";
  const allMenuItems = [...userMenuItems, ...(isAdmin ? adminMenuItems : [])];
  const currentItem = allMenuItems.find((m) => m.id === activeSection);
  const currentLabel = currentItem?.label || "Dashboard";
  const CurrentIcon = currentItem?.Icon;
  const loginId = localStorage.getItem("kuber_user_email") || "Kuber User";

  // Detect if admin deactivated user while they're logged in
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

  return (
    <div className="official-panel flex flex-col h-screen overflow-hidden">
      {showWelcome && <WelcomePopup onClose={() => setShowWelcome(false)} />}

      {/* Admin deactivation notice */}
      {wasDeactivatedByAdmin && (
        <div
          className="fixed top-0 left-0 right-0 z-[998] px-4 py-2 text-center text-xs font-bold"
          style={{
            background: "oklch(0.5 0.2 25)",
            color: "white",
          }}
        >
          Your account has been deactivated by admin. Contact admin for
          re-activation code.
        </div>
      )}

      <div className="gold-top-stripe fixed top-0 left-0 right-0 z-50" />

      {/* Top bar */}
      <div
        className="sticky top-[3px] z-30 flex items-center justify-between px-4 py-3 flex-shrink-0"
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
                    boxShadow:
                      "0 16px 48px oklch(0 0 0 / 70%), 0 0 0 1px oklch(0.65 0.2 220 / 10%)",
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
                      src={LOGO}
                      alt="Kuber Panel"
                      className="w-7 h-7 flex-shrink-0"
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
                          logout();
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
          {/* Activation status badge */}
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
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 z-50"
                style={{
                  width: "240px",
                  background: "oklch(0.09 0.01 220)",
                  border: "1px solid oklch(0.65 0.2 220 / 25%)",
                  borderRadius: "14px",
                  boxShadow: "0 16px 48px oklch(0 0 0 / 70%)",
                }}
                data-ocid="header.user.panel"
              >
                <div
                  className="px-4 py-4 flex flex-col items-center text-center"
                  style={{
                    borderBottom: "1px solid oklch(0.65 0.2 220 / 15%)",
                    background: "oklch(0.08 0.005 220)",
                    borderRadius: "14px 14px 0 0",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-3 gold-glow"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.2 220 / 30%), oklch(0.75 0.17 85 / 20%))",
                      border: "2px solid oklch(0.75 0.17 85 / 40%)",
                    }}
                  >
                    <span className="text-2xl font-black gold-text">
                      {isAdmin ? "A" : loginId.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
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
                      logout();
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
              © {new Date().getFullYear()} KUBER PANEL · Licensed Financial
              Dashboard
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}
