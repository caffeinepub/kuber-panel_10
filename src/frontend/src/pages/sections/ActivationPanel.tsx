import {
  Gamepad2,
  Lock,
  Shuffle,
  TrendingUp,
  Unlock,
  Vote,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";
import { useActor } from "../../hooks/useActor";

const funds = [
  {
    key: "gaming",
    label: "Gaming Fund",
    commission: "15%",
    icon: Gamepad2,
    color: "oklch(0.6 0.2 280)",
    statusKey: "gamingStatus",
  },
  {
    key: "stock",
    label: "Stock Fund",
    commission: "30%",
    icon: TrendingUp,
    color: "oklch(0.7 0.2 145)",
    statusKey: "stockStatus",
  },
  {
    key: "mix",
    label: "Mix Fund",
    commission: "30%",
    icon: Shuffle,
    color: "oklch(0.75 0.15 85)",
    statusKey: "mixStatus",
  },
  {
    key: "political",
    label: "Political Fund",
    commission: "25%",
    icon: Vote,
    color: "oklch(0.6 0.2 25)",
    statusKey: "politicalStatus",
  },
];

export default function ActivationPanel() {
  const { userProfile, refresh } = useApp();
  const { actor } = useActor();
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const handleActivate = async (fundKey: string) => {
    if (!actor) return;
    const code = codes[fundKey]?.trim();
    if (!code) {
      toast.error("Enter activation code");
      return;
    }
    setLoading(fundKey);
    try {
      await actor.activateFund(code);
      toast.success(`${fundKey} fund activated successfully!`);
      setCodes((p) => ({ ...p, [fundKey]: "" }));
      refresh();
    } catch {
      toast.error("Invalid or already used activation code");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold gold-text">Activation Panel</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter activation codes provided by admin to unlock fund options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {funds.map(
          ({ key, label, commission, icon: Icon, color, statusKey }) => {
            const isActivated =
              userProfile?.fundStatus?.[
                statusKey as keyof typeof userProfile.fundStatus
              ]?.isActive ?? false;
            return (
              <div
                key={key}
                data-ocid={`activation.${key}.panel`}
                className="dark-card rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${color} / 15%`,
                        border: `1px solid ${color} / 30%`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {label}
                      </div>
                      <div className="text-xs" style={{ color }}>
                        {commission} Commission
                      </div>
                    </div>
                  </div>
                  {isActivated ? (
                    <div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                      style={{ background: "oklch(0.6 0.2 145 / 15%)" }}
                    >
                      <Unlock
                        className="w-3.5 h-3.5"
                        style={{ color: "oklch(0.7 0.2 145)" }}
                      />
                      <span
                        className="text-xs font-bold"
                        style={{ color: "oklch(0.7 0.2 145)" }}
                      >
                        ACTIVE
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                      style={{ background: "oklch(0.13 0 0)" }}
                    >
                      <Lock className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600">
                        LOCKED
                      </span>
                    </div>
                  )}
                </div>

                {!isActivated && (
                  <div className="flex gap-2">
                    <input
                      value={codes[key] || ""}
                      onChange={(e) =>
                        setCodes((p) => ({ ...p, [key]: e.target.value }))
                      }
                      placeholder="Enter activation code"
                      data-ocid={`activation.${key}_input`}
                      className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
                      style={{
                        background: "oklch(0.13 0 0)",
                        border: "1px solid oklch(0.75 0.15 85 / 20%)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleActivate(key)}
                      disabled={loading === key}
                      data-ocid={`activation.${key}_submit_button`}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-black gold-gradient disabled:opacity-50"
                    >
                      {loading === key ? "..." : "Activate"}
                    </button>
                  </div>
                )}

                {isActivated && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    Fund is active • All related features unlocked
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
