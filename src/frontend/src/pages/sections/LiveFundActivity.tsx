import { Eye, EyeOff, WifiOff } from "lucide-react";
import { useState } from "react";
import BankLogo from "../../components/BankLogo";
import { useApp } from "../../context/AppContext";

const fundLabels: Record<string, string> = {
  gaming: "Gaming Fund",
  stock: "Stock Fund",
  mix: "Mix Fund",
  political: "Political Fund",
};

const fundBadgeLabels: Record<string, string> = {
  gaming: "GAMING FUND",
  stock: "STOCK FUND",
  mix: "MIX FUND",
  political: "POLITICAL FUND",
};

const fundColors: Record<string, string> = {
  gaming: "#7c3aed",
  stock: "#16a34a",
  mix: "#0d9488",
  political: "#dc2626",
};

export default function LiveFundActivity() {
  const { bankAccounts, activeFundSessions, isAdmin, liveTxns } = useApp();
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  const approvedBanks = bankAccounts.filter((b) => b.status === "approved");
  const activeSessions = Object.entries(activeFundSessions);

  const getBankById = (id: string) => approvedBanks.find((b) => b.id === id);

  const toggleDetails = (bankId: string) => {
    setShowDetails((prev) => ({ ...prev, [bankId]: !prev[bankId] }));
  };

  // Non-admin: show offline
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#dc2626" }}
          />
          <h2 className="text-xl font-bold" style={{ color: "#22d3ee" }}>
            LIVE TRANSACTIONS
          </h2>
        </div>
        <div
          className="rounded-2xl p-10 flex flex-col items-center justify-center gap-4 text-center"
          style={{
            background: "#0d0d0d",
            border: "1px solid rgba(220,38,38,0.25)",
          }}
          data-ocid="live_activity.offline_state"
        >
          <WifiOff className="w-10 h-10" style={{ color: "#dc2626" }} />
          <div>
            <div className="font-bold text-white mb-1 text-lg">OFFLINE</div>
            <div className="text-xs text-gray-500">
              Live transaction feed is not available.
            </div>
          </div>
          <div
            className="rounded-xl p-4 w-full mt-2"
            style={{ background: "#000000", border: "1px solid #1a1a1a" }}
          >
            <div className="text-xs text-gray-700 mb-3 font-bold uppercase tracking-widest">
              Bank Details
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Bank Name</span>
                <span className="text-gray-800">---</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Account No.</span>
                <span className="text-gray-800">---</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">IFSC Code</span>
                <span className="text-gray-800">---</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full animate-pulse"
          style={{ background: "#22c55e" }}
        />
        <h2
          className="text-lg font-bold tracking-wide"
          style={{ color: "#22d3ee" }}
        >
          LIVE TRANSACTIONS
        </h2>
      </div>

      {activeSessions.length === 0 ? (
        <div
          data-ocid="live_activity.empty_state"
          className="rounded-xl p-8 text-center"
          style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}
        >
          <WifiOff
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "#333" }}
          />
          <div className="font-bold text-gray-600 mb-1">OFFLINE</div>
          <p className="text-gray-700 text-xs mb-4">
            No fund is currently active.
          </p>
        </div>
      ) : (
        activeSessions.map(([bankId, { fundType }], idx) => {
          const bank = getBankById(bankId);
          if (!bank) return null;
          const color = fundColors[fundType] ?? "#7c3aed";
          const fundLabel = fundLabels[fundType] ?? fundType;
          const isVisible = showDetails[bankId] ?? false;

          return (
            <div
              key={bankId}
              data-ocid={`live_activity.session.${idx + 1}`}
              className="space-y-3"
            >
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "#d4a017" }}
                >
                  Linked Bank Account
                </p>
                <div
                  className="rounded-xl p-4"
                  style={{
                    border: `1px solid ${color}30`,
                    background: "#000000",
                  }}
                >
                  {/* Top row: bank name + approved + Online + eye */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <BankLogo bankName={bank.bankName} size={36} />
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
                    </div>
                    {/* Online status + eye toggle */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ background: "#22c55e" }}
                        />
                        <span
                          className="text-xs font-bold"
                          style={{ color: "#4ade80" }}
                        >
                          Online
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDetails(bankId)}
                        data-ocid="live_activity.details.toggle"
                        className="p-1 rounded-md transition-colors"
                        style={{
                          color: "#22d3ee",
                          background: "rgba(34,211,238,0.1)",
                        }}
                        title={isVisible ? "Hide details" : "Show details"}
                      >
                        {isVisible ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible details */}
                  {isVisible && (
                    <div
                      className="mt-3 pt-3 grid grid-cols-1 gap-1"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {[
                        { label: "Holder Name", value: bank.accountHolderName },
                        { label: "Account No.", value: bank.accountNumber },
                        { label: "IFSC Code", value: bank.ifscCode },
                        ...(bank.upiId
                          ? [{ label: "UPI ID", value: bank.upiId }]
                          : []),
                        ...(bank.mobileNumber
                          ? [{ label: "Mobile", value: bank.mobileNumber }]
                          : []),
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-2"
                        >
                          <span
                            className="text-xs"
                            style={{ color: "#6b7280" }}
                          >
                            {label}
                          </span>
                          <span className="text-xs font-semibold text-gray-200 text-right">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fund name — small */}
                  <div
                    className="mt-3 pt-3"
                    style={{ borderTop: `1px solid ${color}20`, color }}
                  >
                    <span className="text-[11px] font-semibold">
                      {fundLabel} is ON
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Live Transaction Feed */}
      {activeSessions.length > 0 && (
        <div>
          {liveTxns.length === 0 ? (
            <div
              data-ocid="live_activity.txns_empty_state"
              className="rounded-xl p-8 text-center"
              style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}
            >
              <p className="text-gray-600 text-sm">
                Waiting for first transaction...
              </p>
            </div>
          ) : (
            <div
              className="overflow-y-auto space-y-3"
              style={{
                maxHeight: "520px",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              data-ocid="live_activity.txns_list"
            >
              {liveTxns.map((tx, i) => {
                const isCredit = tx.credit > 0;
                const amount = isCredit ? tx.credit : tx.debit;
                const bank = getBankById(tx.bankId);
                const fundBadge =
                  fundBadgeLabels[tx.fundType] ?? tx.fundType.toUpperCase();

                return (
                  <div
                    key={tx.id}
                    data-ocid={`live_activity.tx.${i + 1}`}
                    className="rounded-2xl px-4 py-4"
                    style={{
                      background: "#000000",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {/* Row 1: CREDIT/DEBIT badge + FUND badge + Amount */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[12px] font-black px-3 py-1 rounded-lg text-white"
                          style={{
                            background: isCredit ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {isCredit ? "CREDIT" : "DEBIT"}
                        </span>
                        <span
                          className="text-[9px] font-semibold px-2 py-0.5 rounded-lg whitespace-nowrap"
                          style={{
                            background: "#2a2a2a",
                            color: "#9ca3af",
                          }}
                        >
                          {fundBadge}
                        </span>
                      </div>
                      <span
                        className="text-xl font-black tracking-tight"
                        style={{ color: isCredit ? "#4ade80" : "#f87171" }}
                      >
                        {isCredit ? "+" : "-"}₹{amount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Row 2: UTR (left) + Date (right) */}
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-gray-400">
                        <span className="text-gray-400">UTR: </span>
                        {tx.utrNumber}
                      </span>
                      <span className="text-[12px] text-gray-400">
                        {tx.date}
                      </span>
                    </div>

                    {/* Row 3: Bank name (left) + Time (right) */}
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[12px] text-gray-400">
                        {bank?.bankName ?? ""}
                      </span>
                      <span className="text-[12px] text-gray-400">
                        {tx.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
