import { Download, ExternalLink, Printer, X } from "lucide-react";
import { useState } from "react";
import type { WithdrawalData } from "../../backend";
import { useApp } from "../../context/AppContext";

function generateReceiptHTML(
  w: WithdrawalData,
  details: Record<string, string>,
  fmtDate: string,
  fmtTime: string,
) {
  const utr = `UTR${w.id.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
  const txnId = `TXN${w.id.replace(/-/g, "").slice(0, 16).toUpperCase()}`;
  const last4 = details.accountNumber
    ? details.accountNumber
        .slice(-4)
        .padStart(details.accountNumber.length, "X")
    : "XXXXXXXX";
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Transaction Receipt</title>
<style>body{font-family:Arial,sans-serif;max-width:400px;margin:40px auto;padding:20px;border:1px solid #ccc;border-radius:8px;}
h2{text-align:center;color:#1a56db;} .badge{text-align:center;background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:20px;display:inline-block;font-weight:bold;margin:8px auto;display:block;width:fit-content;} .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;} .label{color:#6b7280;} .val{font-weight:600;} .footer{text-align:center;color:#9ca3af;font-size:11px;margin-top:16px;}
</style></head><body>
<h2>KUBER PANEL</h2><p class="badge">✓ SUCCESS</p>
<div class="row"><span class="label">UTR Number</span><span class="val">${utr}</span></div>
<div class="row"><span class="label">Transaction ID</span><span class="val">${txnId}</span></div>
<div class="row"><span class="label">Account Number</span><span class="val">${last4}</span></div>
<div class="row"><span class="label">IFSC Code</span><span class="val">${details.ifsc || "KUBER0001234"}</span></div>
<div class="row"><span class="label">Account Holder</span><span class="val">${details.accountHolder || "Account Holder"}</span></div>
<div class="row"><span class="label">Bank Name</span><span class="val">${details.bankName || "KUBER BANK"}</span></div>
<div class="row"><span class="label">Amount</span><span class="val">₹${w.amount.toLocaleString("en-IN")}</span></div>
<div class="row"><span class="label">Date</span><span class="val">${fmtDate}</span></div>
<div class="row"><span class="label">Time</span><span class="val">${fmtTime}</span></div>
<div class="row"><span class="label">Transfer Mode</span><span class="val">${details.transferMode || w.method.toUpperCase()}</span></div>
<div class="row"><span class="label">Status</span><span class="val" style="color:#16a34a">${w.status.toUpperCase()}</span></div>
<div class="footer">This is a computer-generated receipt. KUBER PANEL Official Platform.</div>
</body></html>`;
}

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

  const parseDetails = (d: string): Record<string, string> => {
    try {
      return JSON.parse(d) as Record<string, string>;
    } catch {
      return {};
    }
  };

  const handlePrint = () => window.print();

  const handleOpen = (w: WithdrawalData) => {
    const d = parseDetails(w.methodDetails);
    const html = generateReceiptHTML(
      w,
      d,
      fmtDate(w.createdAt),
      fmtTime(w.createdAt),
    );
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const handleDownload = (w: WithdrawalData) => {
    const d = parseDetails(w.methodDetails);
    const html = generateReceiptHTML(
      w,
      d,
      fmtDate(w.createdAt),
      fmtTime(w.createdAt),
    );
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const utr = `UTR${w.id.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
    a.download = `receipt-${utr}.html`;
    a.click();
    URL.revokeObjectURL(url);
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
              {["Date", "Time", "Amount", "Method", "UTR Number", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider gold-text"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr data-ocid="withdrawal_history.empty_state">
                <td colSpan={6} className="text-center py-10 text-gray-600">
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
                tabIndex={0}
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
                  {w.utrNumber ||
                    `UTR${w.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0 0 0 / 85%)" }}
          data-ocid="withdrawal_history.dialog"
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.09 0.008 220)",
              border: "1px solid oklch(0.65 0.2 220 / 35%)",
            }}
          >
            {/* Receipt header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.12 0.02 220), oklch(0.1 0.01 220))",
                borderBottom: "1px solid oklch(0.65 0.2 220 / 20%)",
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/assets/uploads/IMG_20260316_083839_204-removebg-preview-1.png"
                  alt="logo"
                  className="w-9 h-9"
                />
                <div>
                  <div className="font-black text-sm gold-text tracking-widest">
                    KUBER PANEL
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Transaction Receipt
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                data-ocid="withdrawal_history.close_button"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Success badge */}
            <div
              className="text-center py-3"
              style={{ borderBottom: "1px solid oklch(0.65 0.2 220 / 15%)" }}
            >
              <span
                className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest"
                style={{
                  background: "oklch(0.62 0.2 145 / 20%)",
                  color: "oklch(0.72 0.2 145)",
                  border: "1px solid oklch(0.62 0.2 145 / 40%)",
                }}
              >
                ✓ SUCCESS
              </span>
            </div>

            {/* Receipt rows */}
            <div className="px-5 py-3 space-y-0">
              {(() => {
                const d = parseDetails(selected.methodDetails);
                const utr = `UTR${selected.id.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
                const txnId = `TXN${selected.id.replace(/-/g, "").slice(0, 16).toUpperCase()}`;
                const maskedAcc = d.accountNumber
                  ? `${"X".repeat(Math.max(0, d.accountNumber.length - 4))}${d.accountNumber.slice(-4)}`
                  : "XXXXXXXXXX";
                const rows = [
                  ["UTR Number", utr],
                  ["Transaction ID", txnId],
                  ["Account Number", maskedAcc],
                  ["IFSC Code", d.ifsc || "KUBER0001234"],
                  [
                    "Account Holder",
                    d.accountHolderName || d.accountHolder || "Account Holder",
                  ],
                  ["Bank Name", d.bankName || "KUBER BANK"],
                  [
                    "Transfer Mode",
                    d.transferMode || selected.method.toUpperCase(),
                  ],
                  ["Amount", `₹${selected.amount.toLocaleString("en-IN")}`],
                  ["Date", fmtDate(selected.createdAt)],
                  ["Time", fmtTime(selected.createdAt)],
                  ["Status", selected.status.toUpperCase()],
                ];
                return rows.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-2"
                    style={{
                      borderBottom: "1px solid oklch(0.65 0.2 220 / 8%)",
                    }}
                  >
                    <span className="text-[11px] text-gray-500">{k}</span>
                    <span
                      className="text-[11px] font-semibold"
                      style={{
                        color:
                          k === "Status"
                            ? "oklch(0.72 0.2 145)"
                            : k === "Amount"
                              ? "oklch(0.82 0.17 85)"
                              : "white",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ));
              })()}
            </div>

            {/* Footer buttons */}
            <div
              className="px-5 py-4 flex gap-2"
              style={{ borderTop: "1px solid oklch(0.65 0.2 220 / 15%)" }}
            >
              <button
                type="button"
                onClick={handlePrint}
                data-ocid="withdrawal_history.print_button"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-black gold-gradient"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                type="button"
                onClick={() => handleOpen(selected)}
                data-ocid="withdrawal_history.open_button"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  background: "oklch(0.65 0.2 220 / 15%)",
                  color: "oklch(0.75 0.18 220)",
                  border: "1px solid oklch(0.65 0.2 220 / 25%)",
                }}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </button>
              <button
                type="button"
                onClick={() => handleDownload(selected)}
                data-ocid="withdrawal_history.download_button"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  background: "oklch(0.14 0 0)",
                  color: "oklch(0.65 0 0)",
                  border: "1px solid oklch(0.75 0.15 85 / 15%)",
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
