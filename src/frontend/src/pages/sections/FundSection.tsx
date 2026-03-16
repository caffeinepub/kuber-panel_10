import { KeyRound, Lock, Power, PowerOff } from "lucide-react";
import { useApp } from "../../context/AppContext";

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

const fundLabels: Record<string, string> = {
  gaming: "Gaming",
  stock: "Stock",
  mix: "Mix",
  political: "Political",
};

export default function FundSection({ fundType, commission }: Props) {
  const {
    bankAccounts,
    activeFundSessions,
    setActiveFundSession,
    clearFundSession,
    isFundActive,
    isAdmin,
    setActiveSection,
  } = useApp();

  const approvedBanks = bankAccounts.filter((b) => b.status === "approved");
  const color = fundColors[fundType];
  const fundLabel = fundLabels[fundType];

  // Check if this specific fund is activated
  const isFundUnlocked = isAdmin || isFundActive(fundType);

  const handleToggle = (bankId: string) => {
    const existing = activeFundSessions[bankId];
    if (existing && existing.fundType === fundType) {
      clearFundSession(bankId);
    } else {
      const sessionId = `session_${Date.now()}`;
      setActiveFundSession(bankId, sessionId, fundType);
    }
  };

  if (!isFundUnlocked) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold" style={{ color }}>
          {fundLabel} Fund ({commission}% Commission)
        </h2>
        <div className="dark-card rounded-xl p-12 text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: "oklch(0.75 0.15 85 / 12%)",
              border: "1px solid oklch(0.75 0.15 85 / 25%)",
            }}
          >
            <Lock className="w-8 h-8 gold-text" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {fundLabel} Fund Locked
            </h3>
            <p className="text-gray-500 text-sm">
              This fund requires a{" "}
              <span
                className="font-bold"
                style={{ color: "oklch(0.8 0.17 85)" }}
              >
                {fundLabel} Fund activation code
              </span>
              .
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Get the code from admin and activate in Activation Panel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveSection("activation" as any)}
            data-ocid={`${fundType}_fund.activate_button`}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-bold text-black gold-gradient"
          >
            <KeyRound className="w-4 h-4" />
            Go to Activation Panel
          </button>
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
        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: `${color} / 12%`,
            color,
            border: `1px solid ${color} / 25%`,
          }}
        >
          ACTIVATED
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
          return (
            <div
              key={bank.id}
              data-ocid={`${fundType}_fund.item.${i + 1}`}
              className="dark-card rounded-xl p-5"
              style={{ border: isOn ? `1px solid ${color} / 30%` : undefined }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${color} / 12%`,
                      border: `1px solid ${color} / 25%`,
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
                      <span
                        className="text-xs font-bold"
                        style={{ color: "oklch(0.7 0.2 145)" }}
                      >
                        LIVE
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggle(bank.id)}
                    data-ocid={`${fundType}_fund.toggle.${i + 1}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: isOn
                        ? "oklch(0.5 0.2 25 / 15%)"
                        : `${color} / 15%`,
                      border: isOn
                        ? "1px solid oklch(0.5 0.2 25 / 30%)"
                        : `1px solid ${color} / 30%`,
                      color: isOn ? "oklch(0.7 0.2 25)" : color,
                    }}
                  >
                    {isOn ? (
                      <PowerOff className="w-3.5 h-3.5" />
                    ) : (
                      <Power className="w-3.5 h-3.5" />
                    )}
                    {isOn ? "Turn OFF" : "Turn ON"}
                  </button>
                </div>
              </div>
              {isOn && (
                <div
                  className="mt-3 pt-3 flex items-center gap-2 text-xs text-gray-500"
                  style={{ borderTop: `1px solid ${color} / 10%` }}
                >
                  <div className="live-dot" />
                  <span>
                    Transactions active • {commission}% commission accumulating
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
