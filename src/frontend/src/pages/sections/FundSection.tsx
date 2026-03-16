import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";
import { useActor } from "../../hooks/useActor";

interface Props {
  fundType: "gaming" | "stock" | "mix" | "political";
  commission: number;
}

const fundColors: Record<string, string> = {
  gaming: "oklch(0.6 0.2 280)",
  stock: "oklch(0.7 0.2 145)",
  mix: "oklch(0.75 0.15 85)",
  political: "oklch(0.6 0.2 25)",
};

export default function FundSection({ fundType, commission }: Props) {
  const {
    bankAccounts,
    activeFundSessions,
    setActiveFundSession,
    clearFundSession,
    refresh,
    userProfile,
  } = useApp();
  const { actor } = useActor();
  const [toggling, setToggling] = useState<string | null>(null);

  const approvedBanks = bankAccounts.filter((b) => b.status === "approved");
  const color = fundColors[fundType];

  // Check if fund is activated
  const fundStatusKey = `${fundType}Status` as
    | "gamingStatus"
    | "stockStatus"
    | "mixStatus"
    | "politicalStatus";
  const isActivated =
    userProfile?.fundStatus?.[fundStatusKey]?.isActive ?? false;

  const toggleFund = async (bankId: string) => {
    if (!actor) return;
    setToggling(bankId);
    try {
      const existing = activeFundSessions[bankId];
      if (existing && existing.fundType === fundType) {
        // Turn OFF
        await actor.endFundSession(existing.sessionId);
        clearFundSession(bankId);
        toast.success(`${fundType} fund stopped. Commission being calculated.`);
      } else {
        // Turn ON
        const sessionId = await actor.startFundSession(bankId, fundType);
        setActiveFundSession(bankId, sessionId, fundType);
        toast.success(`${fundType} fund started! Transactions will begin.`);
      }
      refresh();
    } catch (_e) {
      toast.error("Failed to toggle fund");
    } finally {
      setToggling(null);
    }
  };

  const fundLabel = {
    gaming: "Gaming",
    stock: "Stock",
    mix: "Mix",
    political: "Political",
  }[fundType];

  if (!isActivated) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold" style={{ color }}>
          {fundLabel} Fund ({commission}% Commission)
        </h2>
        <div className="dark-card rounded-xl p-12 text-center">
          <Lock
            className="w-14 h-14 mx-auto mb-4"
            style={{ color: "oklch(0.75 0.15 85 / 40%)" }}
          />
          <h3 className="text-lg font-bold text-white mb-2">
            Activation Required
          </h3>
          <p className="text-gray-500 text-sm">
            You need an activation code to use {fundLabel} Fund.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Contact admin to get your activation code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color }}>
            {fundLabel} Fund
          </h2>
          <p
            className="text-sm mt-0.5"
            style={{ color: "oklch(0.75 0.15 85)" }}
          >
            {commission}% Commission on all transactions
          </p>
        </div>
      </div>

      {approvedBanks.length === 0 && (
        <div
          data-ocid={`${fundType}_fund.empty_state`}
          className="dark-card rounded-xl p-10 text-center"
        >
          <p className="text-gray-500">
            No approved bank accounts. Add and get a bank approved first.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {approvedBanks.map((bank, i) => {
          const isOn = activeFundSessions[bank.id]?.fundType === fundType;
          const isLoading = toggling === bank.id;
          return (
            <div
              key={bank.id}
              data-ocid={`${fundType}_fund.item.${i + 1}`}
              className="dark-card rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${color} / 15%`,
                      border: `1px solid ${color} / 30%`,
                    }}
                  >
                    <span className="text-xl font-black" style={{ color }}>
                      {bank.bankName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-white">{bank.bankName}</div>
                    <div className="text-xs text-gray-500">
                      {bank.accountHolderName}
                    </div>
                    <div className="text-xs text-gray-600">
                      {bank.accountNumber} • {bank.ifscCode}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isOn && (
                    <div className="flex items-center gap-1.5">
                      <div className="live-dot" />
                      <span className="text-xs text-green-400 font-medium">
                        LIVE
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleFund(bank.id)}
                    disabled={isLoading}
                    data-ocid={`${fundType}_fund.toggle.${i + 1}`}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                      isOn ? "" : "bg-gray-700"
                    }`}
                    style={isOn ? { background: color } : {}}
                  >
                    <div
                      className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-300 ${
                        isOn ? "left-7" : "left-0.5"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-bold ${
                      isOn ? "text-green-400" : "text-gray-600"
                    }`}
                  >
                    {isLoading ? "..." : isOn ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
              {isOn && (
                <div
                  className="mt-3 pt-3 flex items-center gap-2 text-xs text-gray-500"
                  style={{ borderTop: "1px solid oklch(0.75 0.15 85 / 10%)" }}
                >
                  <div className="live-dot" />
                  <span>
                    Transactions active • {commission}% commission will be added
                    when stopped
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
