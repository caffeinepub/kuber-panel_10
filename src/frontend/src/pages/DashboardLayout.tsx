import {
  Activity,
  ArrowDownCircle,
  Building2,
  CheckSquare,
  ChevronRight,
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
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
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

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      className="font-mono text-xs"
      style={{ color: "oklch(0.65 0.2 220 / 80%)" }}
    >
      {now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}
      {" • "}
      {now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  );
}

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

export default function DashboardLayout() {
  const { activeSection, setActiveSection, isAdmin, userProfile } = useApp();
  const { clear } = useInternetIdentity();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isOverlayOpen = activeSection !== "dashboard";

  const allMenuItems = [...userMenuItems, ...(isAdmin ? adminMenuItems : [])];
  const currentItem = allMenuItems.find((m) => m.id === activeSection);
  const currentLabel = currentItem?.label || "Dashboard";
  const CurrentIcon = currentItem?.Icon;

  const closeOverlay = () => setActiveSection("dashboard" as any);

  return (
    <div className="official-panel flex h-screen overflow-hidden">
      {/* Accent top stripe */}
      <div className="gold-top-stripe fixed top-0 left-0 right-0 z-50" />

      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col transition-all duration-300 mt-[3px] ${
          sidebarOpen ? "w-64" : "w-14"
        }`}
        style={{
          background: "oklch(0.07 0 0)",
          borderRight: "1px solid oklch(0.65 0.2 220 / 15%)",
          boxShadow: "2px 0 24px oklch(0.65 0.2 220 / 6%)",
        }}
      >
        {/* Logo area + 3-dot toggle */}
        <div
          className="flex items-center gap-3 px-3 py-4"
          style={{
            borderBottom: "1px solid oklch(0.65 0.2 220 / 15%)",
            background: "oklch(0.08 0.005 220)",
          }}
        >
          <img
            src="/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png"
            alt="Kuber Panel"
            className="w-8 h-8 flex-shrink-0 drop-shadow-lg"
          />
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm tracking-widest shimmer-text">
                KUBER PANEL
              </div>
              <div
                className="text-[9px] tracking-[0.18em] uppercase mt-0.5"
                style={{ color: "oklch(0.65 0.2 220 / 55%)" }}
              >
                Official Platform
              </div>
              {isAdmin && (
                <div
                  className="text-[10px] font-semibold mt-0.5"
                  style={{ color: "oklch(0.62 0.2 145)" }}
                >
                  ● ADMIN ACCESS
                </div>
              )}
            </div>
          )}
          {/* 3-dot toggle button — always visible */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200"
            style={{
              color: "oklch(0.65 0.2 220 / 70%)",
              background: sidebarOpen
                ? "oklch(0.65 0.2 220 / 12%)"
                : "transparent",
            }}
            data-ocid="sidebar.toggle"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {sidebarOpen && (
            <div className="px-3 pb-2 pt-1">
              <div
                className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                style={{ color: "oklch(0.65 0.2 220 / 50%)" }}
              >
                Main Menu
              </div>
            </div>
          )}

          {userMenuItems.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => {
                setActiveSection(id as any);
                setSidebarOpen(false);
              }}
              data-ocid={`nav.${id.replace(/-/g, "_")}.link`}
              title={!sidebarOpen ? label : undefined}
              className={`sidebar-item w-full text-left ${
                activeSection === id ? "active" : "text-gray-400"
              }`}
            >
              <div className="flex-shrink-0">
                <Icon
                  className={`w-4 h-4 ${
                    activeSection === id ? "gold-text" : ""
                  }`}
                />
              </div>
              {sidebarOpen && (
                <span className="text-xs font-medium truncate">{label}</span>
              )}
              {sidebarOpen && activeSection === id && (
                <ChevronRight className="w-3 h-3 ml-auto gold-text" />
              )}
            </button>
          ))}

          {isAdmin && (
            <>
              <div className="px-3 pt-4 pb-1.5">
                {sidebarOpen ? (
                  <div
                    className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                    style={{ color: "oklch(0.65 0.2 220 / 70%)" }}
                  >
                    ⚙ Admin Panel
                  </div>
                ) : (
                  <div
                    style={{
                      height: "1px",
                      background: "oklch(0.65 0.2 220 / 20%)",
                    }}
                  />
                )}
              </div>
              {adminMenuItems.map(({ id, label, Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => {
                    setActiveSection(id as any);
                    setSidebarOpen(false);
                  }}
                  data-ocid={`nav.${id.replace(/-/g, "_")}.link`}
                  title={!sidebarOpen ? label : undefined}
                  className={`sidebar-item w-full text-left ${
                    activeSection === id ? "active" : "text-gray-400"
                  }`}
                  style={{
                    borderLeft:
                      activeSection === id
                        ? "3px solid oklch(0.65 0.2 220)"
                        : undefined,
                  }}
                >
                  <div className="flex-shrink-0">
                    <Icon
                      className={`w-4 h-4 ${
                        activeSection === id ? "gold-text" : ""
                      }`}
                    />
                  </div>
                  {sidebarOpen && (
                    <span className="text-xs font-medium truncate">
                      {label}
                    </span>
                  )}
                  {sidebarOpen && activeSection === id && (
                    <ChevronRight className="w-3 h-3 ml-auto gold-text" />
                  )}
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Licensed badge + Logout */}
        <div style={{ borderTop: "1px solid oklch(0.65 0.2 220 / 15%)" }}>
          {sidebarOpen && (
            <div
              className="mx-3 my-2 px-3 py-2 rounded-lg flex items-center gap-2"
              style={{
                background: "oklch(0.65 0.2 220 / 8%)",
                border: "1px solid oklch(0.65 0.2 220 / 20%)",
              }}
            >
              <Shield className="w-3.5 h-3.5 gold-text flex-shrink-0" />
              <div>
                <div className="text-[9px] font-bold tracking-[0.12em] uppercase gold-text">
                  Licensed & Secured
                </div>
                <div
                  className="text-[8px] tracking-wide"
                  style={{ color: "oklch(0.65 0.2 220 / 45%)" }}
                >
                  Official Financial Platform
                </div>
              </div>
            </div>
          )}
          <div className="p-2">
            <button
              type="button"
              onClick={clear}
              data-ocid="sidebar.logout_button"
              title="Logout"
              className="sidebar-item w-full text-gray-500 hover:text-red-400"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="text-xs">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content — always DashboardHome */}
      <main className="flex-1 overflow-y-auto mt-[3px] flex flex-col">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-3"
          style={{
            background: "oklch(0.08 0.005 220 / 95%)",
            borderBottom: "1px solid oklch(0.65 0.2 220 / 15%)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <img
              src="/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png"
              alt="Kuber Panel"
              className="w-7 h-7 flex-shrink-0 md:hidden"
            />
            <div>
              <div className="text-sm font-bold text-white">Dashboard</div>
              <div className="hidden sm:block">
                <LiveClock />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* LIVE indicator */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: "oklch(0.62 0.2 145 / 12%)",
                border: "1px solid oklch(0.62 0.2 145 / 30%)",
              }}
            >
              <span className="live-dot" />
              <span
                className="text-[10px] font-bold tracking-wider"
                style={{ color: "oklch(0.72 0.18 145)" }}
              >
                LIVE
              </span>
            </div>

            <div className="text-right">
              <div className="text-xs gold-text font-semibold tracking-wider">
                {isAdmin ? "● ADMIN" : "● USER"}
              </div>
              <div className="text-xs text-gray-500 truncate max-w-32">
                {userProfile?.name || "Kuber User"}
              </div>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center gold-glow"
              style={{
                background: "oklch(0.65 0.2 220 / 15%)",
                border: "1px solid oklch(0.65 0.2 220 / 40%)",
              }}
            >
              <span className="text-xs gold-text font-bold">
                {isAdmin ? "A" : "U"}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard always visible */}
        <div className="p-6 flex-1">
          <DashboardHome />
        </div>

        {/* Footer */}
        <footer
          className="px-6 py-3 text-center"
          style={{ borderTop: "1px solid oklch(0.65 0.2 220 / 10%)" }}
        >
          <p className="text-[10px] text-gray-600">
            © {new Date().getFullYear()} KUBER PANEL · Licensed Financial
            Dashboard ·{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </footer>
      </main>

      {/* Overlay backdrop */}
      <div
        data-ocid="overlay.panel"
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background: "oklch(0 0 0 / 60%)",
          backdropFilter: isOverlayOpen ? "blur(2px)" : "none",
          opacity: isOverlayOpen ? 1 : 0,
          pointerEvents: isOverlayOpen ? "auto" : "none",
          top: "3px",
        }}
        onClick={closeOverlay}
        onKeyDown={(e) => e.key === "Escape" && closeOverlay()}
        role="button"
        tabIndex={-1}
        aria-label="Close panel"
      />

      {/* Slide-in overlay panel */}
      <div
        className="fixed top-[3px] right-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: "min(500px, 92vw)",
          background: "oklch(0.09 0.008 220)",
          borderLeft: "1px solid oklch(0.65 0.2 220 / 25%)",
          boxShadow: "-8px 0 40px oklch(0 0 0 / 60%)",
          transform: isOverlayOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{
            background: "oklch(0.08 0.005 220)",
            borderBottom: "1px solid oklch(0.65 0.2 220 / 20%)",
          }}
        >
          {CurrentIcon && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.65 0.2 220 / 15%)",
                border: "1px solid oklch(0.65 0.2 220 / 30%)",
              }}
            >
              <CurrentIcon className="w-4 h-4 gold-text" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">
              {currentLabel}
            </div>
            <div
              className="text-[10px] tracking-wider uppercase"
              style={{ color: "oklch(0.65 0.2 220 / 55%)" }}
            >
              KUBER PANEL
            </div>
          </div>
          <button
            type="button"
            onClick={closeOverlay}
            data-ocid="overlay.close_button"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0"
            style={{
              background: "oklch(0.65 0.2 220 / 10%)",
              border: "1px solid oklch(0.65 0.2 220 / 20%)",
              color: "oklch(0.75 0.1 220)",
            }}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isOverlayOpen && renderSectionContent(activeSection)}
        </div>
      </div>
    </div>
  );
}
