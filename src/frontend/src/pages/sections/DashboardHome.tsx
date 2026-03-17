import {
  Activity,
  Banknote,
  BarChart2,
  CheckSquare,
  CircleDollarSign,
  Code2,
  Flag,
  Gamepad2,
  Headphones,
  KeyRound,
  Landmark,
  Layers,
  Lock,
  ScrollText,
  ShieldCheck,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import StableLogo from "../../components/StableLogo";
import { useApp } from "../../context/AppContext";

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
  const [activeBanner] = useState(true);

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
      Icon: Landmark,
      gradient: "linear-gradient(145deg, #060e20, #000)",
      accent: "#3b82f6",
      iconBg: "rgba(59,130,246,0.14)",
    },
    {
      id: "bank-statement",
      label: "Bank Statement",
      desc: "Transaction history",
      Icon: ScrollText,
      gradient: "linear-gradient(145deg, #051508, #000)",
      accent: "#10b981",
      iconBg: "rgba(16,185,129,0.14)",
    },
    {
      id: "gaming-fund",
      label: "Gaming Fund",
      desc: "15% commission",
      Icon: Gamepad2,
      gradient: "linear-gradient(145deg, #180a30, #000)",
      accent: "#9333ea",
      iconBg: "rgba(147,51,234,0.14)",
    },
    {
      id: "stock-fund",
      label: "Stock Fund",
      desc: "30% commission",
      Icon: BarChart2,
      gradient: "linear-gradient(145deg, #051a12, #000)",
      accent: "#14b8a6",
      iconBg: "rgba(20,184,166,0.14)",
    },
    {
      id: "political-fund",
      label: "Political Fund",
      desc: "30% commission",
      Icon: Flag,
      gradient: "linear-gradient(145deg, #220606, #000)",
      accent: "#ef4444",
      iconBg: "rgba(239,68,68,0.14)",
    },
    {
      id: "mix-fund",
      label: "Mix Fund",
      desc: "25% commission",
      Icon: Layers,
      gradient: "linear-gradient(145deg, #041218, #000)",
      accent: "#06b6d4",
      iconBg: "rgba(6,182,212,0.14)",
    },
    {
      id: "commission",
      label: "My Commission",
      desc: "Track earnings",
      Icon: CircleDollarSign,
      gradient: "linear-gradient(145deg, #1c1200, #000)",
      accent: "#f59e0b",
      iconBg: "rgba(245,158,11,0.14)",
    },
    {
      id: "live-activity",
      label: "Live Fund Activity",
      desc: "Real-time updates",
      Icon: Zap,
      gradient: "linear-gradient(145deg, #041420, #000)",
      accent: "#22d3ee",
      iconBg: "rgba(34,211,238,0.14)",
    },
    {
      id: "withdrawal",
      label: "Withdrawal",
      desc: "IMPS / NEFT / RTGS",
      Icon: Banknote,
      gradient: "linear-gradient(145deg, #130828, #000)",
      accent: "#a78bfa",
      iconBg: "rgba(167,139,250,0.14)",
    },
    {
      id: "withdrawal-history",
      label: "Withdrawal History",
      desc: "Past transactions",
      Icon: Timer,
      gradient: "linear-gradient(145deg, #180612, #000)",
      accent: "#f472b6",
      iconBg: "rgba(244,114,182,0.14)",
    },
    {
      id: "activation",
      label: "Activation Panel",
      desc: "Unlock fund options",
      Icon: ShieldCheck,
      gradient: "linear-gradient(145deg, #1c1500, #000)",
      accent: "#fbbf24",
      iconBg: "rgba(251,191,36,0.14)",
    },
    {
      id: "help-support",
      label: "Help Support",
      desc: "Telegram support",
      Icon: Headphones,
      gradient: "linear-gradient(145deg, #040e18, #000)",
      accent: "#38bdf8",
      iconBg: "rgba(56,189,248,0.14)",
    },
  ];

  const adminOptions = [
    {
      id: "generated-code",
      label: "Generated Codes",
      desc: "Create & manage codes",
      Icon: Code2,
      gradient: "linear-gradient(145deg, #050c20, #000)",
      accent: "#818cf8",
      iconBg: "rgba(129,140,248,0.14)",
    },
    {
      id: "user-management",
      label: "User Management",
      desc: "View all users",
      Icon: Users,
      gradient: "linear-gradient(145deg, #051510, #000)",
      accent: "#4ade80",
      iconBg: "rgba(74,222,128,0.14)",
    },
    {
      id: "bank-approval",
      label: "Bank Approval",
      desc: "Approve accounts",
      Icon: CheckSquare,
      gradient: "linear-gradient(145deg, #1a1000, #000)",
      accent: "#fb923c",
      iconBg: "rgba(251,146,60,0.14)",
    },
    {
      id: "change-support",
      label: "Change Support Link",
      desc: "Update Telegram link",
      Icon: Activity,
      gradient: "linear-gradient(145deg, #0e0520, #000)",
      accent: "#c084fc",
      iconBg: "rgba(192,132,252,0.14)",
    },
  ];

  type CardItem = (typeof dashboardOptions)[number];
  const CardGrid = ({ items }: { items: CardItem[] }) => (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ id, label, desc, Icon, gradient, accent, iconBg }) => {
        const locked = isCardLocked(id);
        return (
          <button
            type="button"
            key={id}
            onClick={() => setActiveSection(id as any)}
            data-ocid={`dashboard.${id.replace(/-/g, "_")}.button`}
            className="relative flex flex-col p-4 rounded-2xl text-left transition-all duration-200 active:scale-95 overflow-hidden"
            style={{
              background: locked ? "#060606" : gradient,
              minHeight: "120px",
              border: locked ? "1px solid #181818" : `1px solid ${accent}28`,
              boxShadow: locked
                ? "none"
                : `0 2px 20px rgba(0,0,0,0.85), inset 0 1px 0 ${accent}10`,
              opacity: locked ? 0.4 : 1,
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
              style={{
                background: locked
                  ? "#181818"
                  : `linear-gradient(90deg, transparent, ${accent}90, transparent)`,
              }}
            />
            {!locked && (
              <div
                className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top right, ${accent}18, transparent 70%)`,
                }}
              />
            )}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 flex-shrink-0"
              style={{ background: locked ? "rgba(255,255,255,0.02)" : iconBg }}
            >
              {locked ? (
                <Lock className="w-5 h-5" style={{ color: "#222" }} />
              ) : (
                <Icon className="w-5 h-5" style={{ color: accent }} />
              )}
            </div>
            <div className="mt-auto w-full min-w-0">
              <div
                className="text-xs font-bold leading-tight line-clamp-2 break-words w-full"
                style={{ color: locked ? "#282828" : "#f0f4f8" }}
              >
                {label}
              </div>
              <div
                className="text-[11px] mt-0.5 line-clamp-2 break-words"
                style={{ color: locked ? "#222" : `${accent}85` }}
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
      {activeBanner && (
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #080f1e, #050c14)",
            border: "1px solid rgba(0,180,255,0.2)",
          }}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at right center, rgba(0,180,255,0.1), transparent 70%)",
            }}
          />
          {/* Bigger logo — fully visible */}
          <StableLogo size={96} />
          <div className="relative z-10 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-black tracking-widest shimmer-text">
                KUBER PANEL
              </h1>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider"
                style={{
                  background: "rgba(0,180,255,0.12)",
                  border: "1px solid rgba(0,180,255,0.3)",
                  color: "rgba(0,200,255,0.9)",
                }}
              >
                OFFICIAL
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
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
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(239,68,68,0.12)",
                  border:
                    isAdmin || isActivated
                      ? "1px solid rgba(34,197,94,0.3)"
                      : "1px solid rgba(239,68,68,0.3)",
                  color: isAdmin || isActivated ? "#4ade80" : "#f87171",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isAdmin || isActivated ? "#4ade80" : "#f87171",
                  }}
                />
                {isAdmin || isActivated ? "ACTIVE" : "NOT ACTIVATED"}
              </div>
              {!isAdmin && !isActivated && (
                <button
                  type="button"
                  onClick={() => setActiveSection("activation" as any)}
                  data-ocid="dashboard.activate_banner.button"
                  className="px-3 py-0.5 rounded-lg text-[10px] font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,160,255,0.8), rgba(80,60,220,0.8))",
                  }}
                >
                  🔑 Activate Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-[0.15em]">
            Dashboard Options
          </h3>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(255,255,255,0.06)" }}
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
              style={{ color: "rgba(0,180,255,0.7)" }}
            >
              ⚙ Admin Options
            </h3>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>
          <CardGrid items={adminOptions} />
        </div>
      )}
    </div>
  );
}
