import { FileText } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function BankStatement() {
  const { transactions, bankAccounts } = useApp();

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentTxns = transactions
    .filter((t) => Number(t.date) / 1_000_000 > thirtyDaysAgo)
    .sort((a, b) => Number(b.date) - Number(a.date));

  const getBankName = (id: string) =>
    bankAccounts.find((b) => b.id === id)?.bankName || "Unknown";

  const formatDate = (nano: bigint) => {
    const d = new Date(Number(nano) / 1_000_000);
    return d.toLocaleDateString("en-IN");
  };

  const formatTime = (nano: bigint) => {
    const d = new Date(Number(nano) / 1_000_000);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  let balance = 0;
  const txnsWithBalance = [...recentTxns]
    .reverse()
    .map((t) => {
      balance += t.creditAmount - t.debitAmount;
      return { ...t, runningBalance: balance };
    })
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold gold-text">
            Bank Account Statement
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Last 30 days transaction history
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Total Transactions</div>
          <div className="text-2xl font-bold text-white">
            {recentTxns.length}
          </div>
        </div>
      </div>

      <div className="dark-card rounded-xl overflow-hidden">
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: "oklch(0.75 0.15 85 / 15%)",
            borderBottom: "1px solid oklch(0.75 0.15 85 / 25%)",
          }}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 gold-text" />
            <span className="text-sm font-bold gold-text">
              STATEMENT - 30 DAYS
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString("en-IN")}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" data-ocid="bank_statement.table">
            <thead>
              <tr
                style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}
              >
                {[
                  "Date",
                  "Time",
                  "Bank",
                  "UTR Number",
                  "Fund Type",
                  "Credit (₹)",
                  "Debit (₹)",
                  "Balance (₹)",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "oklch(0.75 0.15 85)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txnsWithBalance.length === 0 && (
                <tr data-ocid="bank_statement.empty_state">
                  <td colSpan={8} className="text-center py-12 text-gray-600">
                    No transactions in last 30 days
                  </td>
                </tr>
              )}
              {txnsWithBalance.map((t, i) => (
                <tr
                  key={t.id}
                  data-ocid={`bank_statement.item.${i + 1}`}
                  className="table-row-hover"
                  style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)" }}
                >
                  <td className="px-4 py-3 text-xs text-gray-300">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatTime(t.date)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">
                    {getBankName(t.bankAccountId)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">
                    {t.utrNumber}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase gold-text"
                      style={{ background: "oklch(0.75 0.15 85 / 12%)" }}
                    >
                      {t.fundType}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-xs font-semibold"
                    style={{ color: "oklch(0.7 0.2 145)" }}
                  >
                    {t.creditAmount > 0
                      ? `+${t.creditAmount.toLocaleString("en-IN")}`
                      : "-"}
                  </td>
                  <td
                    className="px-4 py-3 text-xs font-semibold"
                    style={{ color: "oklch(0.65 0.2 25)" }}
                  >
                    {t.debitAmount > 0
                      ? `-${t.debitAmount.toLocaleString("en-IN")}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-white">
                    {t.runningBalance.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
