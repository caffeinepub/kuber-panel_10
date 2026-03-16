import {
  CheckCircle,
  Gamepad2,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  Shuffle,
  TrendingUp,
  Vote,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";
import * as LocalStore from "../../utils/LocalStore";
import {
  isSelfValidatingCode,
  redeemSelfValidatingCode,
} from "../../utils/SelfValidatingCode";

const FUND_INFO = [
  { key: "gaming", label: "Gaming Fund", Icon: Gamepad2, color: "#7c3aed" },
  { key: "stock", label: "Stock Fund", Icon: TrendingUp, color: "#16a34a" },
  { key: "mix", label: "Mix Fund", Icon: Shuffle, color: "#d97706" },
  { key: "political", label: "Political Fund", Icon: Vote, color: "#dc2626" },
  { key: "all", label: "All Funds", Icon: Layers, color: "#7c3aed" },
];

export default function ActivationPanel() {
  const { activatedFunds, userActivation, refresh } = useApp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const isDeactivatedByAdmin =
    userActivation?.deactivatedByAdmin === true && !userActivation?.isActive;

  const handleActivate = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Please enter the activation code");
      return;
    }
    const email =
      localStorage.getItem("kuber_logged_in_user") ||
      localStorage.getItem("kuber_user_email") ||
      "";
    if (!email) {
      toast.error("Please login first");
      return;
    }
    setLoading(true);
    try {
      let fundType: string | undefined;

      // Try self-validating code first
      if (isSelfValidatingCode(trimmed)) {
        const result = redeemSelfValidatingCode(trimmed);
        if (!result.success) {
          toast.error("This activation code has already been used.");
          return;
        }
        fundType = result.fundType;
      } else {
        // Try localStorage code
        const result = LocalStore.redeemCode(trimmed, email);
        if (!result.success) {
          toast.error(
            "Invalid or already used activation code. Please check and try again.",
          );
          return;
        }
        fundType = result.fundType;
      }

      if (!fundType) {
        toast.error("Invalid activation code format.");
        return;
      }

      LocalStore.activateFundForUser(email, fundType, trimmed);
      const fundLabel =
        FUND_INFO.find((f) => f.key === fundType)?.label || "Fund";
      toast.success(`${fundLabel} activated successfully!`);
      setCode("");
      refresh();
    } catch {
      toast.error("Activation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasAnyActivation = activatedFunds.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold gold-text">Activation Panel</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter admin-generated code to activate fund options
        </p>
      </div>

      {isDeactivatedByAdmin && (
        <div
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            background: "oklch(0.5 0.2 25 / 12%)",
            border: "1px solid oklch(0.5 0.2 25 / 30%)",
          }}
        >
          <Lock
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            style={{ color: "oklch(0.65 0.2 25)" }}
          />
          <div>
            <div
              className="font-bold text-sm"
              style={{ color: "oklch(0.7 0.2 25)" }}
            >
              Account Deactivated by Admin
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Get a new activation code from admin to re-activate.
            </div>
          </div>
        </div>
      )}

      {hasAnyActivation && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Activated Funds
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FUND_INFO.filter((f) => f.key !== "all").map(
              ({ key, label, color }) => {
                const isActive =
                  activatedFunds.includes(key) ||
                  activatedFunds.includes("all");
                return (
                  <div
                    key={key}
                    className="rounded-xl p-3 flex items-center gap-2"
                    style={{
                      background: isActive ? `${color}1a` : "oklch(0.1 0 0)",
                      border: isActive
                        ? `1px solid ${color}4d`
                        : "1px solid oklch(0.2 0 0)",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isActive ? `${color}33` : "oklch(0.15 0 0)",
                      }}
                    >
                      {isActive ? (
                        <CheckCircle className="w-4 h-4" style={{ color }} />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div
                        className="text-xs font-semibold"
                        style={{ color: isActive ? color : "oklch(0.5 0 0)" }}
                      >
                        {label}
                      </div>
                      <div
                        className="text-[9px]"
                        style={{
                          color: isActive
                            ? "oklch(0.65 0 0)"
                            : "oklch(0.4 0 0)",
                        }}
                      >
                        {isActive ? "ACTIVE" : "LOCKED"}
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      <div
        data-ocid="activation.panel"
        className="dark-card rounded-2xl p-6 space-y-5"
        style={{ border: "1px solid oklch(0.75 0.15 85 / 20%)" }}
      >
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{
              background: "oklch(0.75 0.15 85 / 12%)",
              border: "1px solid oklch(0.75 0.15 85 / 30%)",
            }}
          >
            <KeyRound className="w-7 h-7 gold-text" />
          </div>
          <div className="text-base font-bold text-white mb-1">
            {hasAnyActivation
              ? "Activate Another Fund"
              : "Enter Activation Code"}
          </div>
          <div className="text-xs text-gray-500">
            Each fund requires its own activation code from admin
          </div>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleActivate()}
            placeholder="Enter activation code"
            data-ocid="activation.code.input"
            className="w-full px-4 py-3 rounded-xl text-center text-base font-mono font-bold text-white placeholder-gray-600 outline-none"
            style={{
              background: "oklch(0.07 0 0)",
              border: "1px solid oklch(0.75 0.15 85 / 30%)",
              letterSpacing: "0.15em",
            }}
          />
          <button
            type="button"
            onClick={handleActivate}
            disabled={loading || !code.trim()}
            data-ocid="activation.submit_button"
            className="w-full py-3 rounded-xl text-sm font-bold text-black gold-gradient disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Activating..." : "Activate Fund"}
          </button>
        </div>
        <div
          className="text-center text-xs text-gray-600 px-4 py-3 rounded-lg space-y-1"
          style={{ background: "oklch(0.07 0 0)" }}
        >
          <div>Each code activates only its specific fund type</div>
          <div>Codes are one-time use and never expire until used</div>
        </div>
      </div>
    </div>
  );
}
