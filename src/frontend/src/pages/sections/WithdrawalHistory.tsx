import { Download, ExternalLink, Printer, X } from "lucide-react";
import { useState } from "react";
import type { WithdrawalData } from "../../backend";
import { useApp } from "../../context/AppContext";

function getBranchNameFromIFSC(ifsc: string): string {
  if (!ifsc || ifsc.length < 6) return ifsc || "";
  const bankPrefix = ifsc.slice(0, 4).toUpperCase();
  const branchCode = ifsc.slice(5).toUpperCase();

  const bankMap: Record<string, string> = {
    SBIN: "State Bank of India",
    HDFC: "HDFC Bank",
    ICIC: "ICICI Bank",
    PUNB: "Punjab National Bank",
    UTIB: "Axis Bank",
    KKBK: "Kotak Mahindra Bank",
    BARB: "Bank of Baroda",
    CNRB: "Canara Bank",
    UBIN: "Union Bank of India",
    IOBA: "Indian Overseas Bank",
    BKID: "Bank of India",
    IDBI: "IDBI Bank",
    YESB: "Yes Bank",
    INDB: "IndusInd Bank",
    MAHB: "Bank of Maharashtra",
    ALLA: "Allahabad Bank",
    ANDB: "Andhra Bank",
    CORP: "Corporation Bank",
    FDRL: "Federal Bank",
    KARB: "Karnataka Bank",
  };

  const cityMap: Record<string, string> = {
    "0000": "Main Branch",
    "0001": "New Delhi",
    "0002": "Mumbai",
    "0003": "Kolkata",
    "0004": "Chennai",
    "0005": "Bangalore",
    "0006": "Hyderabad",
    "0007": "Ahmedabad",
    "0008": "Pune",
    "0009": "Jaipur",
    "0010": "Lucknow",
    "0011": "Surat",
    MUM: "Mumbai",
    DEL: "New Delhi",
    BNG: "Bangalore",
    CHN: "Chennai",
    HYD: "Hyderabad",
    KOL: "Kolkata",
    AHM: "Ahmedabad",
    PUN: "Pune",
    JAI: "Jaipur",
    LKN: "Lucknow",
    SRT: "Surat",
    NAG: "Nagpur",
    IND: "Indore",
    BHO: "Bhopal",
    PAT: "Patna",
    CHD: "Chandigarh",
  };

  const bankName = bankMap[bankPrefix] ?? `${bankPrefix} Bank`;

  let city = "";
  for (const [code, cityName] of Object.entries(cityMap)) {
    if (branchCode.startsWith(code)) {
      city = cityName;
      break;
    }
  }
  if (!city && branchCode.length > 0) {
    city = `${branchCode.slice(0, 3)} Branch`;
  }

  return city ? `${bankName}, ${city}` : bankName;
}

function buildReceiptRows(
  w: WithdrawalData,
  d: Record<string, string>,
  fmtDate: string,
  fmtTime: string,
): Array<[string, string]> {
  const cleanId = w.id.replace(/-/g, "").toUpperCase();
  const utr12 = cleanId.slice(0, 12);
  const txnId = `TXN${cleanId.slice(0, 16)}`;
  const numericPart = w.id.replace(/[^0-9]/g, "").padEnd(16, "0");
  const rrn12 = numericPart.slice(0, 12);
  const rrn16 = numericPart.slice(0, 16).padEnd(16, "0");
  const upiRef = numericPart.slice(2, 14);

  const maskedAcc = d.accountNumber
    ? `${"X".repeat(Math.max(0, d.accountNumber.length - 4))}${d.accountNumber.slice(-4)}`
    : "XXXXXXXXXX";
  const branchName = getBranchNameFromIFSC(d.ifsc || "");
  const transferMode = d.transferMode || w.method.toUpperCase();
  const amount = `₹${w.amount.toLocaleString("en-IN")}`;
  const status = w.status.toUpperCase();

  const method = w.method?.toLowerCase();

  if (method === "upi") {
    return [
      ["UTR Number", utr12],
      ["Transaction ID", txnId],
      ["UPI Ref No", upiRef],
      ["VPA / UPI ID", d.upiId || d.upiAddress || "---"],
      ["Amount", amount],
      ["Date", fmtDate],
      ["Time", fmtTime],
      ["Status", status],
    ];
  }

  if (method === "usdt") {
    return [
      ["UTR Number", utr12],
      ["Transaction ID", txnId],
      ["TXN Hash", cleanId.slice(0, 32)],
      ["Network", "TRC20"],
      ["Wallet Address", d.usdtAddress || "---"],
      ["Amount", amount],
      ["Date", fmtDate],
      ["Time", fmtTime],
      ["Status", status],
    ];
  }

  // Bank transfer — IMPS / NEFT / RTGS
  const isIMPS = transferMode === "IMPS";
  const rrnLabel = isIMPS ? "RRN / IMPS Ref No" : "RRN Number";
  const rrnValue = isIMPS ? rrn12 : rrn16;

  return [
    ["UTR Number", utr12],
    ["Transaction ID", txnId],
    [rrnLabel, rrnValue],
    ["Account Number", maskedAcc],
    ["IFSC Code", d.ifsc || "---"],
    ["Account Holder", d.accountHolderName || d.accountHolder || "---"],
    ["Bank Name", d.bankName || "---"],
    ["Branch Name", branchName],
    ["Transfer Mode", transferMode],
    ["Amount", amount],
    ["Date", fmtDate],
    ["Time", fmtTime],
    ["Status", status],
  ];
}

function generateReceiptHTML(
  w: WithdrawalData,
  d: Record<string, string>,
  fmtDate: string,
  fmtTime: string,
) {
  const rows = buildReceiptRows(w, d, fmtDate, fmtTime);
  const rowsHTML = rows
    .map(
      ([k, v]) =>
        `<div class="row"><span class="label">${k}</span><span class="val" style="${
          k === "Status"
            ? "color:#16a34a"
            : k === "Amount"
              ? "color:#d4a017"
              : ""
        }">${v}</span></div>`,
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Transaction Receipt — KUBER PANEL</title>
<style>body{font-family:Arial,sans-serif;max-width:420px;margin:40px auto;padding:24px;background:#0a0f1e;color:#e2e8f0;border:1px solid #1e3a5f;border-radius:12px;}
h2{text-align:center;color:#60a5fa;letter-spacing:4px;margin-bottom:4px;} .sub{text-align:center;color:#64748b;font-size:12px;margin-bottom:12px;} .badge{text-align:center;background:rgba(22,163,74,0.15);color:#4ade80;padding:4px 16px;border-radius:20px;display:inline-block;font-weight:bold;margin:8px auto 16px;border:1px solid rgba(22,163,74,0.35);width:fit-content;display:block;} .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px;} .label{color:#64748b;} .val{font-weight:600;font-family:monospace;text-align:right;max-width:58%;word-break:break-all;} .footer{text-align:center;color:#374151;font-size:10px;margin-top:16px;}
</style></head><body>
<h2>KUBER PANEL</h2><p class="sub">Transaction Receipt</p><p class="badge">✓ SUCCESS</p>
${rowsHTML}
<div class="footer">This is a computer-generated receipt. KUBER PANEL Official Platform.</div>
</body></html>`;
}

export default function WithdrawalHistory() {
  const { withdrawals } = useApp();
  const [selected, setSelected] = useState<WithdrawalData | null>(null);

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const localWithdrawals: any[] = JSON.parse(
    localStorage.getItem("kuber_withdrawal_history") ?? "[]",
  );
  const allWithdrawals = [...withdrawals];
  for (const lw of localWithdrawals) {
    if (!allWithdrawals.find((w) => w.id === lw.id)) {
      allWithdrawals.push({
        ...lw,
        createdAt: BigInt(lw.createdAt) * BigInt(1_000_000),
      });
    }
  }
  const recent = allWithdrawals
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
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[600px]"
            data-ocid="withdrawal_history.table"
          >
            <thead>
              <tr
                style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}
              >
                {[
                  "Date",
                  "Time",
                  "Amount",
                  "Method",
                  "UTR Number",
                  "Status",
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
                  <td className="px-4 py-3 text-xs text-gray-300 whitespace-nowrap">
                    {fmtDate(w.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {fmtTime(w.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold gold-text whitespace-nowrap">
                    ₹{w.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-xs text-white uppercase whitespace-nowrap">
                    {w.method}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400 whitespace-nowrap">
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
      </div>

      {/* Full-screen Receipt Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: "#000000" }}
          data-ocid="withdrawal_history.dialog"
        >
          <div
            className="w-full h-full flex flex-col"
            style={{ background: "oklch(0.07 0.008 220)" }}
          >
            {/* Receipt header */}
            <div
              className="px-5 py-4 flex items-center justify-between flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.12 0.02 220), oklch(0.10 0.01 220))",
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
                className="p-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Success badge */}
            <div
              className="text-center py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid oklch(0.65 0.2 220 / 15%)" }}
            >
              <span
                className="px-5 py-1.5 rounded-full text-xs font-black tracking-widest"
                style={{
                  background: "oklch(0.62 0.2 145 / 20%)",
                  color: "oklch(0.72 0.2 145)",
                  border: "1px solid oklch(0.62 0.2 145 / 40%)",
                }}
              >
                ✓ SUCCESS
              </span>
            </div>

            {/* Receipt rows — scrollable, fills remaining height */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {(() => {
                const d = parseDetails(selected.methodDetails);
                const rows = buildReceiptRows(
                  selected,
                  d,
                  fmtDate(selected.createdAt),
                  fmtTime(selected.createdAt),
                );
                return rows.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-3"
                    style={{
                      borderBottom: "1px solid oklch(0.65 0.2 220 / 8%)",
                    }}
                  >
                    <span className="text-[12px] text-gray-500 flex-shrink-0 mr-4">
                      {k}
                    </span>
                    <span
                      className="text-[12px] font-semibold font-mono text-right break-all"
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
              className="px-5 py-4 flex gap-2 flex-shrink-0"
              style={{ borderTop: "1px solid oklch(0.65 0.2 220 / 15%)" }}
            >
              <button
                type="button"
                onClick={handlePrint}
                data-ocid="withdrawal_history.print_button"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold text-black gold-gradient"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                type="button"
                onClick={() => handleOpen(selected)}
                data-ocid="withdrawal_history.open_button"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold"
                style={{
                  background: "oklch(0.65 0.2 220 / 15%)",
                  color: "oklch(0.75 0.18 220)",
                  border: "1px solid oklch(0.65 0.2 220 / 25%)",
                }}
              >
                <ExternalLink className="w-4 h-4" /> Open
              </button>
              <button
                type="button"
                onClick={() => handleDownload(selected)}
                data-ocid="withdrawal_history.download_button"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold"
                style={{
                  background: "oklch(0.14 0 0)",
                  color: "oklch(0.65 0 0)",
                  border: "1px solid oklch(0.75 0.15 85 / 15%)",
                }}
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
