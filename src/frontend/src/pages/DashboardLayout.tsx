import {
  Activity,
  ArrowLeft,
  Building2,
  CheckSquare,
  Code2,
  Coins,
  FileText,
  Gamepad2,
  HelpCircle,
  History,
  KeyRound,
  MoreVertical,
  Shuffle,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import ActivationPanel from "./sections/ActivationPanel";
import AddBankAccount from "./sections/AddBankAccount";
import AccountStatement from "./sections/BankStatement";
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

const LOGO1 = "/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png";
const LOGO2 = "/assets/uploads/IMG_20260311_153614_686-removebg-preview-2.png";

// Preload both logos immediately
const _preload1 = new window.Image();
_preload1.src = LOGO1;
const _preload2 = new window.Image();
_preload2.src = LOGO2;

const menuItems = [
  { id: "dashboard", label: "Dashboard", Icon: Building2 },
  { id: "add-bank", label: "Add Bank Account", Icon: Building2 },
  { id: "bank-statement", label: "Bank Statement", Icon: FileText },
  { id: "gaming-fund", label: "Gaming Fund (15%)", Icon: Gamepad2 },
  { id: "stock-fund", label: "Stock Fund (30%)", Icon: TrendingUp },
  { id: "mix-fund", label: "Mix Fund (25%)", Icon: Shuffle },
  { id: "political-fund", label: "Political Fund (30%)", Icon: Vote },
  { id: "commission", label: "My Commission", Icon: Coins },
  { id: "live-activity", label: "Live Fund Activity", Icon: Activity },
  { id: "withdrawal", label: "Withdrawal", Icon: History },
  { id: "withdrawal-history", label: "Withdrawal History", Icon: History },
  { id: "activation", label: "Activation Panel", Icon: KeyRound },
  { id: "help-support", label: "Help & Support", Icon: HelpCircle },
];

const adminMenuItems = [
  { id: "generated-code", label: "Generated Codes", Icon: Code2 },
  { id: "user-management", label: "User Management", Icon: Users },
  { id: "bank-approval", label: "Bank Approval", Icon: CheckSquare },
  { id: "change-support", label: "Change Support Link", Icon: HelpCircle },
];

export default function DashboardLayout() {
  const {
    isAdmin,
    isActivated,
    activeSection,
    setActiveSection,
    userEmail,
    logout,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "add-bank":
        return <AddBankAccount />;
      case "bank-statement":
        return <AccountStatement />;
      case "gaming-fund":
        return <FundSection fundType="gaming" commission={15} />;
      case "stock-fund":
        return <FundSection fundType="stock" commission={30} />;
      case "mix-fund":
        return <FundSection fundType="mix" commission={25} />;
      case "political-fund":
        return <FundSection fundType="political" commission={30} />;
      case "commission":
        return <MyCommission />;
      case "live-activity":
        return <LiveFundActivity />;
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
        return <DashboardHome />;
    }
  };

  const sectionTitle = (() => {
    const all = [...menuItems, ...adminMenuItems];
    return all.find((m) => m.id === activeSection)?.label ?? "Dashboard";
  })();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#000000", color: "#fff" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "oklch(0.06 0.01 220)",
          borderBottom: "1px solid oklch(0.65 0.15 220 / 18%)",
        }}
      >
        {/* Left: back arrow or empty */}
        <div className="w-10">
          {activeSection !== "dashboard" && (
            <button
              type="button"
              onClick={() => setActiveSection("dashboard")}
              data-ocid="header.back_button"
              className="p-2 rounded-xl transition-colors"
              style={{
                background: "oklch(0.12 0.02 220)",
                border: "1px solid oklch(0.65 0.15 220 / 25%)",
              }}
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Center: section title or KUBER PANEL on dashboard */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {activeSection === "dashboard" ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{
                  background:
                    isAdmin || isActivated
                      ? "oklch(0.62 0.2 145 / 15%)"
                      : "oklch(0.5 0.2 25 / 15%)",
                  border:
                    isAdmin || isActivated
                      ? "1px solid oklch(0.62 0.2 145 / 30%)"
                      : "1px solid oklch(0.5 0.2 25 / 30%)",
                  color:
                    isAdmin || isActivated
                      ? "oklch(0.72 0.2 145)"
                      : "oklch(0.65 0.2 25)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      isAdmin || isActivated
                        ? "oklch(0.72 0.2 145)"
                        : "oklch(0.65 0.2 25)",
                  }}
                />
                {isAdmin || isActivated ? "ACTIVE" : "NOT ACTIVATED"}
              </div>
            </div>
          ) : (
            <span className="text-sm font-bold text-white truncate max-w-[180px]">
              {sectionTitle}
            </span>
          )}
        </div>

        {/* Right: three-dot menu */}
        <div className="relative w-10 flex justify-end" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            data-ocid="header.menu_button"
            className="p-2 rounded-xl transition-colors"
            style={{
              background: menuOpen
                ? "oklch(0.18 0.03 220)"
                : "oklch(0.12 0.02 220)",
              border: "1px solid oklch(0.65 0.15 220 / 25%)",
            }}
          >
            <MoreVertical className="w-4 h-4 text-white" />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0 top-12 w-64 rounded-2xl overflow-hidden shadow-2xl z-50"
              style={{
                background: "oklch(0.08 0.015 220)",
                border: "1px solid oklch(0.65 0.15 220 / 25%)",
              }}
              data-ocid="header.dropdown_menu"
            >
              {/* User info */}
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{
                  borderBottom: "1px solid oklch(0.65 0.15 220 / 12%)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.75 0.17 85), oklch(0.65 0.2 60))",
                    color: "#000",
                  }}
                >
                  {(userEmail?.[0] ?? "U").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div
                    className="text-[10px] font-bold truncate"
                    style={{ color: "oklch(0.8 0.17 85)" }}
                  >
                    {userEmail || "User"}
                  </div>
                  <div className="text-[9px] text-gray-600">
                    {isAdmin ? "Administrator" : "Member"}
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1 max-h-[70vh] overflow-y-auto">
                {menuItems.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setActiveSection(id as any);
                      setMenuOpen(false);
                    }}
                    data-ocid={`menu.${id.replace(/-/g, "_")}.link`}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5"
                    style={{
                      color:
                        activeSection === id ? "oklch(0.8 0.17 85)" : "#ccc",
                      background:
                        activeSection === id
                          ? "oklch(0.75 0.15 85 / 8%)"
                          : "transparent",
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}

                {isAdmin && (
                  <>
                    <div
                      className="mx-4 my-1 h-px"
                      style={{
                        background: "oklch(0.65 0.15 220 / 15%)",
                      }}
                    />
                    <div className="px-4 py-1">
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest"
                        style={{ color: "oklch(0.65 0.2 220)" }}
                      >
                        Admin Panel
                      </span>
                    </div>
                    {adminMenuItems.map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setActiveSection(id as any);
                          setMenuOpen(false);
                        }}
                        data-ocid={`menu.${id.replace(/-/g, "_")}.link`}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5"
                        style={{
                          color:
                            activeSection === id
                              ? "oklch(0.8 0.2 220)"
                              : "#bbb",
                          background:
                            activeSection === id
                              ? "oklch(0.65 0.2 220 / 8%)"
                              : "transparent",
                        }}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </>
                )}

                <div
                  className="mx-4 my-1 h-px"
                  style={{ background: "oklch(0.5 0.2 25 / 20%)" }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  data-ocid="menu.logout.button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm"
                  style={{ color: "oklch(0.65 0.2 25)" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-5 pb-8 max-w-lg mx-auto w-full">
        {renderSection()}
      </main>

      {/* Footer */}
      <footer
        className="text-center py-3 text-[10px]"
        style={{ color: "oklch(0.4 0 0)" }}
      >
        KUBER PANEL &middot; Licensed Financial Dashboard
      </footer>
    </div>
  );
}
