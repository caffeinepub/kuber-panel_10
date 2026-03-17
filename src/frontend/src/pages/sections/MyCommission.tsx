import { ArrowDownCircle } from "lucide-react";
import BankLogo from "../../components/BankLogo";
import { useApp } from "../../context/AppContext";
import * as LocalStore from "../../utils/LocalStore";
import type { CommissionHistoryEntry } from "../../utils/LocalStore";

const fundColors: Record<string, string> = {
  gaming: "#7c3aed",
  stock: "#16a34a",
  mix: "#0d9488",
  political: "#dc2626",
};

export default function MyCommission() {
  const { setActiveSection, isAdmin } = useApp();

  const adminBalance = LocalStore.getAdminCommission();
  const commissionHistory: CommissionHistoryEntry[] =
    LocalStore.getCommissionHistory();

  const displayBalance = isAdmin ? adminBalance : 0;

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN");
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

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
              ₹
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
              <div
                key={entry.id}
                data-ocid={`commission.item.${i + 1}`}
                className="rounded-xl p-4"
                style={{
                  background: "#000000",
                  border: `1px solid ${color}25`,
                }}
              >
                <div className="flex items-start justify-between gap-2 min-w-0">
                  {/* Left side: BankLogo + text content */}
                  <div className="flex items-start gap-3 flex-1 min-w-0 overflow-hidden">
                    <BankLogo bankName={entry.bankName} size={32} />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-xs font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `${color}18`, color }}
                        >
                          {entry.fundLabel} Fund
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mb-0.5 truncate">
                        {entry.bankName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        Acc: {entry.accountNumber}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1 break-all">
                        {fmtDate(entry.startTime)} {fmtTime(entry.startTime)} →{" "}
                        {fmtDate(entry.endTime)} {fmtTime(entry.endTime)}
                      </div>
                    </div>
                  </div>
                  {/* Right side amount — fixed width, no overflow */}
                  <div className="text-right flex-shrink-0 max-w-[110px]">
                    <div className="text-lg font-black gold-text break-all">
                      +₹
                      {entry.totalCommission.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      Commission earned
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
