import {
  Activity,
  ArrowDownCircle,
  Building2,
  CheckSquare,
  Code2,
  Coins,
  FileText,
  Gamepad2,
  HelpCircle,
  History,
  KeyRound,
  Lock,
  Shuffle,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const LOGO = "/assets/uploads/IMG_20260311_153614_686-removebg-preview-2.png";

// Sections requiring ANY fund activation
const GENERAL_ACTIVATION_REQUIRED = new Set([
  "add-bank",
  "bank-statement",
  "live-activity",
  "commission",
  "withdrawal",
  "withdrawal-history",
]);

// Sections requiring SPECIFIC fund activation
const FUND_SPECIFIC: Record<string, string> = {
  "gaming-fund": "gaming",
  "stock-fund": "stock",
  "mix-fund": "mix",
  "political-fund": "political",
};

export default function DashboardHome() {
  const { isAdmin, isActivated, isFundActive, setActiveSection } = useApp();

  const isCardLocked = (id: string): boolean => {
    if (isAdmin) return false;
    if (id === "help-support" || id === "activation") return false;
    if (FUND_SPECIFIC[id]) return !isFundActive(FUND_SPECIFIC[id]);
    if (GENERAL_ACTIVATION_REQUIRED.has(id)) return !isActivated;
    return false;
  };

  const dashboardOptions = [
    {
      id: "add-bank",
      label: "Add Bank Account",
      desc: "Link your bank securely",
      Icon: Building2,
      gradient:
        "linear-gradient(135deg, #0f2460 0%, #1a4db8 50%, #2563eb 100%)",
      glow: "#2563eb",
    },
    {
      id: "bank-statement",
      label: "Bank Statement",
      desc: "Transaction history",
      Icon: FileText,
      gradient:
        "linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)",
      glow: "#059669",
    },
    {
      id: "gaming-fund",
      label: "Gaming Fund",
      desc: "15% commission",
      Icon: Gamepad2,
      gradient:
        "linear-gradient(135deg, #3b0764 0%, #6d28d9 50%, #7c3aed 100%)",
      glow: "#7c3aed",
    },
    {
      id: "stock-fund",
      label: "Stock Fund",
      desc: "30% commission",
      Icon: TrendingUp,
      gradient:
        "linear-gradient(135deg, #052e16 0%, #15803d 50%, #16a34a 100%)",
      glow: "#16a34a",
    },
    {
      id: "political-fund",
      label: "Political Fund",
      desc: "25% commission",
      Icon: Vote,
      gradient:
        "linear-gradient(135deg, #450a0a 0%, #b91c1c 50%, #dc2626 100%)",
      glow: "#dc2626",
    },
    {
      id: "mix-fund",
      label: "Mix Fund",
      desc: "30% commission",
      Icon: Shuffle,
      gradient:
        "linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #14b8a6 100%)",
      glow: "#14b8a6",
    },
    {
      id: "commission",
      label: "My Commission",
      desc: "Track earnings",
      Icon: Coins,
      gradient:
        "linear-gradient(135deg, #451a03 0%, #c2410c 50%, #ea580c 100%)",
      glow: "#ea580c",
    },
    {
      id: "live-activity",
      label: "Live Fund Activity",
      desc: "Real-time updates",
      Icon: Activity,
      gradient:
        "linear-gradient(135deg, #0c1445 0%, #1e40af 50%, #3b82f6 100%)",
      glow: "#3b82f6",
    },
    {
      id: "withdrawal",
      label: "Withdrawal",
      desc: "IMPS / NEFT / RTGS",
      Icon: ArrowDownCircle,
      gradient:
        "linear-gradient(135deg, #1a1045 0%, #6d28d9 50%, #8b5cf6 100%)",
      glow: "#8b5cf6",
    },
    {
      id: "withdrawal-history",
      label: "Withdrawal History",
      desc: "Past transactions",
      Icon: History,
      gradient:
        "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)",
      glow: "#1d4ed8",
    },
    {
      id: "activation",
      label: "Activation Panel",
      desc: "Unlock fund options",
      Icon: KeyRound,
      gradient:
        "linear-gradient(135deg, #1c1917 0%, #78350f 50%, #d97706 100%)",
      glow: "#d97706",
    },
    {
      id: "help-support",
      label: "Help Support",
      desc: "Telegram support",
      Icon: HelpCircle,
      gradient:
        "linear-gradient(135deg, #0f2060 0%, #0369a1 50%, #0284c7 100%)",
      glow: "#0284c7",
    },
  ];

  const adminOptions = [
    {
      id: "generated-code",
      label: "Generated Codes",
      desc: "Create & manage codes",
      Icon: Code2,
      gradient:
        "linear-gradient(135deg, #0f2460 0%, #1d4ed8 50%, #2563eb 100%)",
      glow: "#2563eb",
    },
    {
      id: "user-management",
      label: "User Management",
      desc: "View all users",
      Icon: Users,
      gradient:
        "linear-gradient(135deg, #052e16 0%, #15803d 50%, #22c55e 100%)",
      glow: "#22c55e",
    },
    {
      id: "bank-approval",
      label: "Bank Approval",
      desc: "Approve accounts",
      Icon: CheckSquare,
      gradient:
        "linear-gradient(135deg, #451a03 0%, #b45309 50%, #f59e0b 100%)",
      glow: "#f59e0b",
    },
    {
      id: "change-support",
      label: "Change Support Link",
      desc: "Update Telegram link",
      Icon: Code2,
      gradient:
        "linear-gradient(135deg, #3b0764 0%, #7e22ce 50%, #a855f7 100%)",
      glow: "#a855f7",
    },
  ];

  const CardGrid = ({ items }: { items: typeof dashboardOptions }) => (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ id, label, desc, Icon, gradient, glow }) => {
        const locked = isCardLocked(id);
        return (
          <button
            type="button"
            key={id}
            onClick={() => setActiveSection(id as any)}
            data-ocid={`dashboard.${id.replace(/-/g, "_")}.button`}
            className="relative flex flex-col p-4 rounded-2xl text-left transition-all duration-200 active:scale-95 overflow-hidden"
            style={{
              background: gradient,
              minHeight: "118px",
              boxShadow: locked
                ? "0 4px 12px rgba(0,0,0,0.5)"
                : `0 4px 20px ${glow}40, 0 2px 8px rgba(0,0,0,0.4)`,
              opacity: locked ? 0.6 : 1,
            }}
          >
            {/* Top shimmer line */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
            />
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(4px)",
              }}
            >
              {locked ? (
                <Lock className="w-5 h-5 text-white/70" />
              ) : (
                <Icon className="w-5 h-5 text-white" />
              )}
            </div>
            {/* Text */}
            <div className="mt-auto">
              <div className="text-sm font-bold text-white leading-tight">
                {label}
              </div>
              <div
                className="text-[11px] mt-0.5"
                style={{
                  color: locked
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(255,255,255,0.75)",
                }}
              >
                {locked ? "Activate to unlock" : desc}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.09 0.02 220), oklch(0.07 0.01 220))",
          border: "1px solid oklch(0.65 0.2 220 / 30%)",
        }}
      >
        <div
          className="absolute right-0 top-0 bottom-0 w-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at right center, oklch(0.65 0.2 220 / 12%), transparent 70%)",
          }}
        />
        <img
          src={LOGO}
          alt="Kuber Panel"
          className="flex-shrink-0 drop-shadow-lg relative z-10"
          style={{ width: 72, height: 72 }}
        />
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-black tracking-widest shimmer-text">
              KUBER PANEL
            </h1>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider"
              style={{
                background: "oklch(0.65 0.2 220 / 20%)",
                border: "1px solid oklch(0.65 0.2 220 / 40%)",
                color: "oklch(0.85 0.18 210)",
              }}
            >
              OFFICIAL
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {isAdmin
              ? "Admin Control Center — Full Access"
              : isActivated
                ? "Panel Active — Fund Management Dashboard"
                : "Panel Not Activated"}
          </p>
          {!isAdmin && (
            <div className="flex items-center gap-2 mt-1.5">
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{
                  background: isActivated
                    ? "oklch(0.62 0.2 145 / 15%)"
                    : "oklch(0.5 0.2 25 / 15%)",
                  border: isActivated
                    ? "1px solid oklch(0.62 0.2 145 / 30%)"
                    : "1px solid oklch(0.5 0.2 25 / 30%)",
                  color: isActivated
                    ? "oklch(0.72 0.2 145)"
                    : "oklch(0.65 0.2 25)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isActivated
                      ? "oklch(0.72 0.2 145)"
                      : "oklch(0.65 0.2 25)",
                  }}
                />
                {isActivated ? "ACTIVE" : "NOT ACTIVATED"}
              </div>
              {!isActivated && (
                <button
                  type="button"
                  onClick={() => setActiveSection("activation" as any)}
                  data-ocid="dashboard.activate_banner.button"
                  className="px-3 py-0.5 rounded-lg text-[10px] font-bold text-black gold-gradient"
                >
                  🔑 Activate Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">
            Dashboard Options
          </h3>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        </div>
        <CardGrid items={dashboardOptions} />
      </div>

      {/* Admin Panel Cards */}
      {isAdmin && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3
              className="text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: "oklch(0.65 0.2 220)" }}
            >
              ⚙ Panel Options
            </h3>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
          </div>
          <CardGrid items={adminOptions} />
        </div>
      )}
    </div>
  );
}
