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

// Preload logo immediately
const preloadImg = new window.Image();
preloadImg.src = LOGO;

const GENERAL_ACTIVATION_REQUIRED = new Set([
  "add-bank",
  "bank-statement",
  "live-activity",
  "commission",
  "withdrawal",
  "withdrawal-history",
]);

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
      bg: "#0a1428",
      accent: "#3b82f6",
      iconBg: "rgba(59,130,246,0.12)",
    },
    {
      id: "bank-statement",
      label: "Bank Statement",
      desc: "Transaction history",
      Icon: FileText,
      bg: "#081a12",
      accent: "#22c55e",
      iconBg: "rgba(34,197,94,0.12)",
    },
    {
      id: "gaming-fund",
      label: "Gaming Fund",
      desc: "15% commission",
      Icon: Gamepad2,
      bg: "#110d24",
      accent: "#a855f7",
      iconBg: "rgba(168,85,247,0.12)",
    },
    {
      id: "stock-fund",
      label: "Stock Fund",
      desc: "30% commission",
      Icon: TrendingUp,
      bg: "#091a0e",
      accent: "#10b981",
      iconBg: "rgba(16,185,129,0.12)",
    },
    {
      id: "political-fund",
      label: "Political Fund",
      desc: "25% commission",
      Icon: Vote,
      bg: "#1a0808",
      accent: "#ef4444",
      iconBg: "rgba(239,68,68,0.12)",
    },
    {
      id: "mix-fund",
      label: "Mix Fund",
      desc: "30% commission",
      Icon: Shuffle,
      bg: "#051418",
      accent: "#06b6d4",
      iconBg: "rgba(6,182,212,0.12)",
    },
    {
      id: "commission",
      label: "My Commission",
      desc: "Track earnings",
      Icon: Coins,
      bg: "#1a1208",
      accent: "#f59e0b",
      iconBg: "rgba(245,158,11,0.12)",
    },
    {
      id: "live-activity",
      label: "Live Fund Activity",
      desc: "Real-time updates",
      Icon: Activity,
      bg: "#06101a",
      accent: "#0ea5e9",
      iconBg: "rgba(14,165,233,0.12)",
    },
    {
      id: "withdrawal",
      label: "Withdrawal",
      desc: "IMPS / NEFT / RTGS",
      Icon: ArrowDownCircle,
      bg: "#120d1a",
      accent: "#8b5cf6",
      iconBg: "rgba(139,92,246,0.12)",
    },
    {
      id: "withdrawal-history",
      label: "Withdrawal History",
      desc: "Past transactions",
      Icon: History,
      bg: "#100818",
      accent: "#c084fc",
      iconBg: "rgba(192,132,252,0.12)",
    },
    {
      id: "activation",
      label: "Activation Panel",
      desc: "Unlock fund options",
      Icon: KeyRound,
      bg: "#1a1408",
      accent: "#eab308",
      iconBg: "rgba(234,179,8,0.12)",
    },
    {
      id: "help-support",
      label: "Help Support",
      desc: "Telegram support",
      Icon: HelpCircle,
      bg: "#0a0f1a",
      accent: "#38bdf8",
      iconBg: "rgba(56,189,248,0.12)",
    },
  ];

  const adminOptions = [
    {
      id: "generated-code",
      label: "Generated Codes",
      desc: "Create & manage codes",
      Icon: Code2,
      bg: "#080e1a",
      accent: "#818cf8",
      iconBg: "rgba(129,140,248,0.12)",
    },
    {
      id: "user-management",
      label: "User Management",
      desc: "View all users",
      Icon: Users,
      bg: "#081a0e",
      accent: "#4ade80",
      iconBg: "rgba(74,222,128,0.12)",
    },
    {
      id: "bank-approval",
      label: "Bank Approval",
      desc: "Approve accounts",
      Icon: CheckSquare,
      bg: "#1a1208",
      accent: "#fbbf24",
      iconBg: "rgba(251,191,36,0.12)",
    },
    {
      id: "change-support",
      label: "Change Support Link",
      desc: "Update Telegram link",
      Icon: Code2,
      bg: "#110d24",
      accent: "#c084fc",
      iconBg: "rgba(192,132,252,0.12)",
    },
  ];

  const CardGrid = ({ items }: { items: typeof dashboardOptions }) => (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ id, label, desc, Icon, bg, accent, iconBg }) => {
        const locked = isCardLocked(id);
        return (
          <button
            type="button"
            key={id}
            onClick={() => setActiveSection(id as any)}
            data-ocid={`dashboard.${id.replace(/-/g, "_")}.button`}
            className="relative flex flex-col p-4 rounded-2xl text-left transition-all duration-200 active:scale-95 overflow-hidden"
            style={{
              background: locked
                ? "#0a0a0a"
                : `linear-gradient(145deg, ${bg} 0%, #000000 100%)`,
              minHeight: "118px",
              border: locked ? "1px solid #1a1a1a" : `1px solid ${accent}28`,
              boxShadow: locked
                ? "0 2px 8px rgba(0,0,0,0.8)"
                : `0 2px 12px rgba(0,0,0,0.7), 0 0 0 0 ${accent}00`,
              opacity: locked ? 0.5 : 1,
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
              style={{ background: locked ? "#222" : accent }}
            />
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 flex-shrink-0"
              style={{ background: locked ? "rgba(255,255,255,0.04)" : iconBg }}
            >
              {locked ? (
                <Lock className="w-5 h-5" style={{ color: "#333" }} />
              ) : (
                <Icon className="w-5 h-5" style={{ color: accent }} />
              )}
            </div>
            <div className="mt-auto">
              <div
                className="text-sm font-bold leading-tight truncate w-full"
                style={{ color: locked ? "#444" : "#f1f5f9" }}
              >
                {label}
              </div>
              <div
                className="text-[11px] mt-0.5 line-clamp-2"
                style={{ color: locked ? "#333" : `${accent}bb` }}
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
          loading="eager"
        />
        <div className="relative z-10 flex-1 min-w-0">
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
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {isAdmin || isActivated
              ? "Start New Journey"
              : "Panel Not Activated"}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
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
            {!isAdmin && !isActivated && (
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
