import { KeyRound } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { COMMISSION_RATES } from "../../context/AppContext";
import * as LocalStore from "../../utils/LocalStore";

interface Props {
  fundType: "gaming" | "stock" | "mix" | "political";
  commission: number;
}

const fundColors: Record<string, string> = {
  gaming: "#7c3aed",
  stock: "#16a34a",
  mix: "#0d9488",
  political: "#dc2626",
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
  const commRate = COMMISSION_RATES[fundType] ?? commission / 100;

  const isFundUnlocked = isAdmin || isFundActive(fundType);

  const handleToggle = (bankId: string) => {
    const existing = activeFundSessions[bankId];
    if (existing && existing.fundType === fundType) {
      // Turn OFF - this will log commission history in clearFundSession
      clearFundSession(bankId);
    } else {
      // Turn ON
      const sessionId = `session_${Date.now()}`;
      LocalStore.setSessionStartTime(bankId, new Date().toISOString());
      setActiveFundSession(bankId, sessionId, fundType);
    }
  };

  if (!isFundUnlocked) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white">
          {fundLabel} Fund -{" "}
          <span style={{ color }}>{commission}% Commission</span>
        </h2>
        <div className="dark-card rounded-xl p-12 text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: "oklch(0.75 0.15 85 / 12%)",
              border: "1px solid oklch(0.75 0.15 85 / 25%)",
            }}
          >
            <KeyRound className="w-8 h-8 gold-text" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {fundLabel} Fund Locked
            </h3>
            <p className="text-gray-500 text-sm">
              This fund requires a{" "}
              <span className="font-bold" style={{ color: "#d4a017" }}>
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white leading-tight">
          {fundLabel} Fund -{" "}
          <span style={{ color }}>{commission}% Commission</span>
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Manage your fund activation and view earnings
        </p>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: "rgba(22,163,74,0.15)",
              border: "1px solid rgba(22,163,74,0.3)",
              color: "#4ade80",
            }}
          >
            ✓ ACTIVATED
          </span>
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: "rgba(180,131,9,0.15)",
              border: "1px solid rgba(180,131,9,0.3)",
              color: "#d4a017",
            }}
          >
            {commission}% Commission
          </span>
        </div>
      </div>

      {/* Linked Bank Accounts */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: "#d4a017" }}
        >
          Linked Bank Accounts
        </p>

        {approvedBanks.length === 0 && (
          <div
            data-ocid={`${fundType}_fund.empty_state`}
            className="dark-card rounded-xl p-10 text-center"
          >
            <p className="text-gray-500 text-sm">
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
                className="rounded-xl p-4"
                style={{
                  background: "#0d0d0d",
                  border: isOn ? `1px solid ${color}50` : "1px solid #222",
                }}
              >
                {/* Bank Name + Approved + Toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-white text-sm uppercase">
                        {bank.bankName}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: "rgba(22,163,74,0.15)",
                          border: "1px solid rgba(22,163,74,0.35)",
                          color: "#4ade80",
                        }}
                      >
                        APPROVED
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 font-medium mb-2">
                      {bank.accountHolderName}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-500">
                        Account: {bank.accountNumber} | IFSC: {bank.ifscCode}
                      </p>
                      {bank.upiId && (
                        <p className="text-xs text-gray-500">
                          UPI: {bank.upiId}
                        </p>
                      )}
                      {bank.mobileNumber && (
                        <p className="text-xs text-gray-500">
                          Mobile: {bank.mobileNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Slider Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    onClick={() => handleToggle(bank.id)}
                    data-ocid={`${fundType}_fund.toggle.${i + 1}`}
                    className="flex-shrink-0 relative transition-all duration-300"
                    style={{
                      width: 52,
                      height: 28,
                      borderRadius: 14,
                      background: isOn ? color : "#333",
                      border: isOn ? `1px solid ${color}` : "1px solid #444",
                      cursor: "pointer",
                      outline: "none",
                      marginTop: 2,
                    }}
                  >
                    <span
                      className="absolute top-0.5 transition-all duration-300"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#fff",
                        left: isOn ? "26px" : "3px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                        display: "block",
                      }}
                    />
                  </button>
                </div>

                {/* Separator */}
                <div
                  className="mt-3 pt-3"
                  style={{ borderTop: `1px solid ${color}15` }}
                >
                  <div
                    className="text-xs font-medium"
                    style={{ color: isOn ? color : "#555" }}
                  >
                    {isOn ? (
                      <span className="flex items-center gap-1.5">
                        <span className="live-dot inline-block" />
                        {fundLabel} Fund is ON
                      </span>
                    ) : (
                      `${fundLabel} Fund is OFF`
                    )}
                  </div>
                  {isOn && (
                    <div className="text-[10px] text-gray-600 mt-0.5">
                      {Math.round(commRate * 100)}% commission accumulating
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
