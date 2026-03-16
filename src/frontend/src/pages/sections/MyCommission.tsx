import { ArrowDownCircle, Coins } from "lucide-react";
import { useApp } from "../../context/AppContext";
import * as LocalStore from "../../utils/LocalStore";
import type { CommissionLogEntry } from "../../utils/LocalStore";

export default function MyCommission() {
  const { setActiveSection, isAdmin } = useApp();

  const adminBalance = LocalStore.getAdminCommission();
  const adminLog: CommissionLogEntry[] = LocalStore.getAdminCommissionLog();

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const recentLog = isAdmin
    ? adminLog.filter((c) => c.date > thirtyDaysAgo).slice(0, 100)
    : [];

  const displayBalance = isAdmin ? adminBalance : 0;

  const fundColors: Record<string, string> = {
    gaming: "oklch(0.6 0.2 280)",
    stock: "oklch(0.7 0.2 145)",
    mix: "oklch(0.75 0.15 85)",
    political: "oklch(0.6 0.2 25)",
  };

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
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Available Commission Balance
            </div>
            <div className="text-4xl font-black gold-text">
              ₹
              {displayBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
            {isAdmin && (
              <div className="text-xs text-gray-500 mt-1">
                15% commission from live fund transactions
              </div>
            )}
          </div>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "oklch(0.75 0.15 85 / 15%)" }}
          >
            <Coins className="w-8 h-8 gold-text" />
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

      <div className="dark-card rounded-xl overflow-hidden">
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}
        >
          <span className="text-sm font-bold gold-text">
            COMMISSION HISTORY (30 DAYS)
          </span>
        </div>
        <table className="w-full" data-ocid="commission.table">
          <thead>
            <tr style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}>
              {[
                "Date",
                "Time",
                "Bank Name",
                "Account Number",
                "Fund Type",
                "Commission (₹)",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider gold-text"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentLog.length === 0 ? (
              <tr data-ocid="commission.empty_state">
                <td colSpan={6} className="text-center py-10 text-gray-600">
                  {isAdmin
                    ? "No commission yet. Turn ON Live Fund Activity to start."
                    : "Commission data not available"}
                </td>
              </tr>
            ) : (
              recentLog.map((c, i) => (
                <tr
                  key={c.id}
                  data-ocid={`commission.item.${i + 1}`}
                  className="table-row-hover"
                  style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)" }}
                >
                  <td className="px-4 py-3 text-xs text-gray-300">
                    {fmtDate(c.date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {fmtTime(c.date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-white font-medium">
                    {c.bankName}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {c.accountNumber}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold uppercase"
                      style={{
                        color: fundColors[c.fundType] || "oklch(0.75 0.15 85)",
                        background: "oklch(0.75 0.15 85 / 10%)",
                      }}
                    >
                      {c.fundType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-black gold-text">
                    +₹
                    {c.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
