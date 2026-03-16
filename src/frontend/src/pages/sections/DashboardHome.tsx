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
  Link,
  Shuffle,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const LOGO = "/assets/uploads/IMG_20260311_153614_686-removebg-preview-2.png";

export default function DashboardHome() {
  const { isAdmin, setActiveSection } = useApp();

  const dashboardOptions = [
    {
      id: "add-bank",
      label: "Add Bank Account",
      desc: "Link your bank securely",
      Icon: Building2,
      gradient: "linear-gradient(135deg, #1a3a8f 0%, #2563eb 100%)",
    },
    {
      id: "bank-statement",
      label: "Bank Statement",
      desc: "Transaction history",
      Icon: FileText,
      gradient: "linear-gradient(135deg, #0d5e3f 0%, #16a34a 100%)",
    },
    {
      id: "gaming-fund",
      label: "Gaming Fund",
      desc: "15% commission",
      Icon: Gamepad2,
      gradient: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)",
    },
    {
      id: "stock-fund",
      label: "Stock Fund",
      desc: "30% commission",
      Icon: TrendingUp,
      gradient: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
    },
    {
      id: "political-fund",
      label: "Political Fund",
      desc: "30% commission",
      Icon: Vote,
      gradient: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
    },
    {
      id: "mix-fund",
      label: "Mix Fund",
      desc: "25% commission",
      Icon: Shuffle,
      gradient: "linear-gradient(135deg, #134e4a 0%, #0f766e 100%)",
    },
    {
      id: "commission",
      label: "My Commission",
      desc: "Track your earnings",
      Icon: Coins,
      gradient: "linear-gradient(135deg, #78350f 0%, #d97706 100%)",
    },
    {
      id: "live-activity",
      label: "Live Fund Activity",
      desc: "Real-time updates",
      Icon: Activity,
      gradient: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)",
    },
    {
      id: "withdrawal",
      label: "Withdrawal",
      desc: "UPI / Bank / USDT",
      Icon: ArrowDownCircle,
      gradient: "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)",
    },
    {
      id: "withdrawal-history",
      label: "Withdrawal History",
      desc: "Past transactions",
      Icon: History,
      gradient: "linear-gradient(135deg, #451a03 0%, #92400e 100%)",
    },
    {
      id: "activation",
      label: "Activation Panel",
      desc: "Unlock fund options",
      Icon: KeyRound,
      gradient: "linear-gradient(135deg, #312e81 0%, #6d28d9 100%)",
    },
    {
      id: "help-support",
      label: "Help Support",
      desc: "Telegram support",
      Icon: HelpCircle,
      gradient: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)",
    },
  ];

  const adminOptions = [
    {
      id: "generated-code",
      label: "Generated Codes",
      desc: "Create & manage codes",
      Icon: Code2,
      gradient: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
    },
    {
      id: "user-management",
      label: "User Management",
      desc: "View all users",
      Icon: Users,
      gradient: "linear-gradient(135deg, #0d5e3f 0%, #059669 100%)",
    },
    {
      id: "bank-approval",
      label: "Bank Approval",
      desc: "Approve accounts",
      Icon: CheckSquare,
      gradient: "linear-gradient(135deg, #78350f 0%, #d97706 100%)",
    },
    {
      id: "change-support",
      label: "Change Support Link",
      desc: "Update Telegram link",
      Icon: Link,
      gradient: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)",
    },
  ];

  const CardGrid = ({ items }: { items: typeof dashboardOptions }) => (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ id, label, desc, Icon, gradient }) => (
        <button
          type="button"
          key={id}
          onClick={() => setActiveSection(id as any)}
          data-ocid={`dashboard.${id.replace(/-/g, "_")}.button`}
          className="relative flex flex-col p-4 rounded-2xl text-left transition-all duration-200 active:scale-95 hover:brightness-110 overflow-hidden"
          style={{
            background: gradient,
            minHeight: "120px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          {/* Icon box */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          {/* Text */}
          <div className="mt-auto">
            <div className="text-sm font-bold text-white leading-tight">
              {label}
            </div>
            <div className="text-[11px] text-white/70 mt-0.5">{desc}</div>
          </div>
        </button>
      ))}
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
        <div className="relative z-10">
          <div className="flex items-center gap-2">
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
              ? "Admin Control Center — Full Access Enabled"
              : "Official Financial Management Dashboard"}
          </p>
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
