import { ArrowDownCircle, X } from "lucide-react";
import { useState } from "react";
import BankLogo from "../../components/BankLogo";
import { useApp } from "../../context/AppContext";
import { COMMISSION_RATES } from "../../context/AppContext";
import * as LocalStore from "../../utils/LocalStore";
import type { CommissionHistoryEntry } from "../../utils/LocalStore";
import { fmtTimeUpper } from "../../utils/timeUtils";

const fundColors: Record<string, string> = {
  gaming: "#7c3aed",
  stock: "#16a34a",
  mix: "#0d9488",
  political: "#dc2626",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN");
}
function fmtTime(iso: string) {
  return fmtTimeUpper(new Date(iso));
}

export default function MyCommission() {
  const { setActiveSection, isAdmin } = useApp();
  const [selectedEntry, setSelectedEntry] =
    useState<CommissionHistoryEntry | null>(null);

  const adminBalance = LocalStore.getAdminCommission();
  const commissionHistory: CommissionHistoryEntry[] =
    LocalStore.getCommissionHistory();

  const displayBalance = isAdmin ? adminBalance : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gold-text">My Commission</h2>

      <div
        className="rounded-2xl p-6"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0 0), oklch(0.08 0 0))",
          border: "1px solid oklch(0.75 0.15 85 / 40%)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Available Commission Balance
            </div>
            <div className="text-4xl font-black gold-text break-all">
              \u20b9
              {displayBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveSection("withdrawal")}
          data-ocid="commission.withdraw_button"
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-black gold-gradient"
        >
          <ArrowDownCircle className="w-4 h-4" />
          Withdraw Commission
        </button>
      </div>

      {/* Commission History */}
      <div className="space-y-3">
        <div
          className="px-4 py-3 rounded-t-xl"
          style={{
            background: "rgba(212, 160, 23, 0.1)",
            borderBottom: "1px solid rgba(212,160,23,0.2)",
          }}
        >
          <span className="text-sm font-bold gold-text">
            COMMISSION HISTORY
          </span>
        </div>

        {!isAdmin ? (
          <div
            data-ocid="commission.empty_state"
            className="dark-card rounded-xl p-10 text-center"
          >
            <p className="text-gray-600 text-sm">
              Commission data not available
            </p>
          </div>
        ) : commissionHistory.length === 0 ? (
          <div
            data-ocid="commission.empty_state"
            className="dark-card rounded-xl p-10 text-center"
          >
            <p className="text-gray-600 text-sm">
              No commission yet. Turn ON a fund and turn it OFF to see the
              summary.
            </p>
          </div>
        ) : (
          commissionHistory.map((entry, i) => {
            const color = fundColors[entry.fundType] ?? "#d4a017";
            return (
              <button
                type="button"
                key={entry.id}
                data-ocid={`commission.item.${i + 1}`}
                className="w-full text-left rounded-xl p-4 cursor-pointer transition-all"
                style={{
                  background: "#000000",
                  border: `1px solid ${color}25`,
                }}
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-start gap-3 flex-1 min-w-0 overflow-hidden">
                    <BankLogo bankName={entry.bankName} size={32} />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="text-sm font-bold text-white mb-0.5 truncate">
                        {entry.bankName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        Acc: {entry.accountNumber}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1 break-all">
                        {fmtDate(entry.startTime)} {fmtTime(entry.startTime)}{" "}
                        \u2192 {fmtDate(entry.endTime)} {fmtTime(entry.endTime)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 max-w-[110px]">
                    <div className="text-lg font-black gold-text break-all">
                      +\u20b9
                      {entry.totalCommission.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      Commission earned
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Commission Details Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "#000000" }}
          data-ocid="commission.details.modal"
        >
          <div
            className="px-5 py-4 flex items-center justify-between flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.12 0.02 85), oklch(0.09 0.01 85))",
              borderBottom: "1px solid oklch(0.75 0.15 85 / 20%)",
            }}
          >
            <div className="font-black text-base tracking-widest gold-text">
              Commission Details
            </div>
            <button
              type="button"
              onClick={() => setSelectedEntry(null)}
              data-ocid="commission.details.close_button"
              className="p-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-black uppercase px-3 py-1 rounded-full"
                style={{
                  background: `${fundColors[selectedEntry.fundType] ?? "#d4a017"}20`,
                  color: fundColors[selectedEntry.fundType] ?? "#d4a017",
                  border: `1px solid ${fundColors[selectedEntry.fundType] ?? "#d4a017"}40`,
                }}
              >
                {selectedEntry.fundLabel} Fund
              </span>
            </div>

            <div
              className="rounded-xl p-4"
              style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <BankLogo bankName={selectedEntry.bankName} size={40} />
                <div>
                  <div className="font-black text-white text-sm">
                    {selectedEntry.bankName}
                  </div>
                  <div className="text-xs text-gray-500">
                    A/C: {selectedEntry.accountNumber}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: "rgba(212,160,23,0.06)",
                border: "1px solid rgba(212,160,23,0.2)",
              }}
            >
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Total Commission Earned
              </div>
              <div className="text-4xl font-black gold-text">
                +\u20b9
                {selectedEntry.totalCommission.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Commission Rate:{" "}
                {(
                  (COMMISSION_RATES[selectedEntry.fundType] ?? 0.15) * 100
                ).toFixed(0)}
                %
              </div>
            </div>

            <div className="space-y-0">
              {[
                [
                  "Fund ON",
                  `${fmtDate(selectedEntry.startTime)} ${fmtTime(selectedEntry.startTime)}`,
                ],
                [
                  "Fund OFF",
                  `${fmtDate(selectedEntry.endTime)} ${fmtTime(selectedEntry.endTime)}`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-semibold text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="px-5 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <button
              type="button"
              onClick={() => setSelectedEntry(null)}
              data-ocid="commission.details.cancel_button"
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#9ca3af",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
