import { Activity, WifiOff } from "lucide-react";
import { useApp } from "../../context/AppContext";

const fundLabels: Record<string, string> = {
  gaming: "Gaming Fund",
  stock: "Stock Fund",
  mix: "Mix Fund",
  political: "Political Fund",
};

const fundColors: Record<string, string> = {
  gaming: "#7c3aed",
  stock: "#16a34a",
  mix: "#0d9488",
  political: "#dc2626",
};

export default function LiveFundActivity() {
  const { bankAccounts, activeFundSessions, isAdmin, liveTxns } = useApp();

  const approvedBanks = bankAccounts.filter((b) => b.status === "approved");
  const activeSessions = Object.entries(activeFundSessions);

  const getBankById = (id: string) => approvedBanks.find((b) => b.id === id);

  // Non-admin: show offline
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 gold-text" />
          <h2 className="text-xl font-bold gold-text">Live Fund Activity</h2>
        </div>
        <div
          className="rounded-2xl p-10 flex flex-col items-center justify-center gap-4 text-center"
          style={{
            background: "#000000",
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
      <div className="flex items-center gap-3">
        <Activity className="w-6 h-6 gold-text" />
        <h2 className="text-xl font-bold gold-text">Live Fund Activity</h2>
      </div>

      {/* Active Fund Sessions Info */}
      {activeSessions.length === 0 ? (
        <div
          data-ocid="live_activity.empty_state"
          className="rounded-xl p-8 text-center"
          style={{ background: "#000000", border: "1px solid #1a1a1a" }}
        >
          <WifiOff
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "#333" }}
          />
          <div className="font-bold text-gray-600 mb-1">OFFLINE</div>
          <p className="text-gray-700 text-xs mb-4">
            No fund is currently active.
          </p>
          <div
            className="rounded-xl p-4 text-left mt-3"
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
      ) : (
        activeSessions.map(([bankId, { fundType }], idx) => {
          const bank = getBankById(bankId);
          if (!bank) return null;
          const color = fundColors[fundType] ?? "#7c3aed";
          const fundLabel = fundLabels[fundType] ?? fundType;

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
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="live-dot" />
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#4ade80" }}
                      >
                        Online
                      </span>
                    </div>
                  </div>
                  <div
                    className="mt-3 pt-3 text-xs"
                    style={{ borderTop: `1px solid ${color}20`, color }}
                  >
                    {fundLabel} is ON
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
          <div className="flex items-center gap-2 mb-3">
            <div className="live-dot" />
            <span className="text-sm font-bold gold-text">
              LIVE TRANSACTIONS
            </span>
          </div>

          {liveTxns.length === 0 ? (
            <div
              data-ocid="live_activity.txns_empty_state"
              className="rounded-xl p-8 text-center"
              style={{ background: "#000000", border: "1px solid #1a1a1a" }}
            >
              <p className="text-gray-600 text-sm">
                Waiting for first transaction...
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {liveTxns.map((tx, i) => {
                const isCredit = tx.credit > 0;
                const txBank = getBankById(tx.bankId);
                return (
                  <div
                    key={tx.id}
                    data-ocid={`live_activity.tx.${i + 1}`}
                    className="rounded-xl p-4"
                    style={{
                      background: "#000000",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: isCredit
                                ? "rgba(22,163,74,0.15)"
                                : "rgba(220,38,38,0.15)",
                              color: isCredit ? "#4ade80" : "#f87171",
                            }}
                          >
                            {isCredit ? "CREDIT" : "DEBIT"}
                          </span>
                          <span
                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              color: "#666",
                            }}
                          >
                            {fundLabels[tx.fundType] ?? tx.fundType}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          UTR: {tx.utrNumber}
                        </div>
                        {txBank && (
                          <div className="text-[10px] text-gray-500 font-mono">
                            {txBank.bankName}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className="text-base font-black"
                          style={{ color: isCredit ? "#4ade80" : "#f87171" }}
                        >
                          {isCredit ? "+" : "-"}₹
                          {(isCredit ? tx.credit : tx.debit).toLocaleString(
                            "en-IN",
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {tx.date}
                        </div>
                        <div className="text-[10px] text-gray-600">
                          {tx.time}
                        </div>
                      </div>
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
