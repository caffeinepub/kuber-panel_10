import { Download, Printer, X } from "lucide-react";
import { useState } from "react";
import type { WithdrawalData } from "../../backend";
import { useApp } from "../../context/AppContext";

export default function WithdrawalHistory() {
  const { withdrawals } = useApp();
  const [selected, setSelected] = useState<WithdrawalData | null>(null);

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = withdrawals
    .filter((w) => Number(w.createdAt) / 1_000_000 > thirtyDaysAgo)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  const fmtDate = (n: bigint) =>
    new Date(Number(n) / 1_000_000).toLocaleDateString("en-IN");
  const fmtTime = (n: bigint) =>
    new Date(Number(n) / 1_000_000).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const parseDetails = (d: string) => {
    try {
      return JSON.parse(d);
    } catch {
      return {};
    }
  };

  const handlePrint = () => window.print();
  const handleDownload = () => {
    if (!selected) return;
    const content = `KUBER PANEL - WITHDRAWAL RECEIPT\n\nAmount: ₹${selected.amount}\nMethod: ${selected.method.toUpperCase()}\nUTR: ${selected.utrNumber}\nRef: ${selected.referenceNumber}\nDate: ${fmtDate(selected.createdAt)}\nTime: ${fmtTime(selected.createdAt)}\nStatus: ${selected.status.toUpperCase()}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${selected.utrNumber}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gold-text">Withdrawal History</h2>

      <div className="dark-card rounded-xl overflow-hidden">
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}
        >
          <span className="text-sm font-bold gold-text">LAST 30 DAYS</span>
        </div>
        <table className="w-full" data-ocid="withdrawal_history.table">
          <thead>
            <tr style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}>
              {[
                "Date",
                "Time",
                "Amount",
                "Method",
                "UTR Number",
                "Status",
                "Action",
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
            {recent.length === 0 && (
              <tr data-ocid="withdrawal_history.empty_state">
                <td colSpan={7} className="text-center py-10 text-gray-600">
                  No withdrawal history
                </td>
              </tr>
            )}
            {recent.map((w, i) => (
              <tr
                key={w.id}
                data-ocid={`withdrawal_history.item.${i + 1}`}
                className="table-row-hover cursor-pointer"
                style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)" }}
                onClick={() => setSelected(w)}
                onKeyDown={(e) => e.key === "Enter" && setSelected(w)}
              >
                <td className="px-4 py-3 text-xs text-gray-300">
                  {fmtDate(w.createdAt)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {fmtTime(w.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm font-bold gold-text">
                  ₹{w.amount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-xs text-white uppercase">
                  {w.method}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-gray-400">
                  {w.utrNumber || "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      w.status === "approved"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                    style={{
                      background:
                        w.status === "approved"
                          ? "oklch(0.6 0.2 145 / 15%)"
                          : "oklch(0.75 0.15 85 / 15%)",
                    }}
                  >
                    {w.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-xs gold-text hover:underline"
                    data-ocid={`withdrawal_history.open.button.${i + 1}`}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0 0 0 / 80%)" }}
          data-ocid="withdrawal_history.dialog"
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{
              background: "oklch(0.1 0 0)",
              border: "1px solid oklch(0.75 0.15 85 / 40%)",
            }}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black gold-text text-lg">
                WITHDRAWAL RECEIPT
              </h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                data-ocid="withdrawal_history.close_button"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="text-center py-2">
              <img
                src="/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png"
                alt="logo"
                className="w-12 h-12 mx-auto mb-1"
              />
              <div className="font-black text-sm gold-text tracking-widest">
                KUBER PANEL
              </div>
            </div>

            <div className="space-y-2">
              {[
                ["Amount", `₹${selected.amount.toLocaleString("en-IN")}`],
                ["Method", selected.method.toUpperCase()],
                ["UTR Number", selected.utrNumber || "Processing"],
                ["Reference", selected.referenceNumber || "Processing"],
                ["Date", fmtDate(selected.createdAt)],
                ["Time", fmtTime(selected.createdAt)],
                ["Status", selected.status.toUpperCase()],
                ...Object.entries(parseDetails(selected.methodDetails)).map(
                  ([k, v]) => [k.toUpperCase(), String(v)],
                ),
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-1.5"
                  style={{
                    borderBottom: "1px solid oklch(0.75 0.15 85 / 10%)",
                  }}
                >
                  <span className="text-xs text-gray-500">{k}</span>
                  <span className="text-xs text-white font-semibold">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                data-ocid="withdrawal_history.print_button"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-black gold-gradient"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                type="button"
                onClick={handleDownload}
                data-ocid="withdrawal_history.download_button"
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-white"
                style={{
                  background: "oklch(0.14 0 0)",
                  border: "1px solid oklch(0.75 0.15 85 / 20%)",
                }}
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
