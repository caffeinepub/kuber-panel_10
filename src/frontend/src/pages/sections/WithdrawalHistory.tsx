import {
  Check,
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  Printer,
  X,
} from "lucide-react";
import { useState } from "react";
import type { WithdrawalData } from "../../backend";
import { useApp } from "../../context/AppContext";
import { fmtTimeUpper } from "../../utils/timeUtils";

// IFSC lookup helpers
const BANK_MAP: Record<string, string> = {
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

const CITY_HINTS: [string, string][] = [
  ["MUM", "Mumbai"],
  ["DEL", "New Delhi"],
  ["BNG", "Bangalore"],
  ["CHN", "Chennai"],
  ["HYD", "Hyderabad"],
  ["KOL", "Kolkata"],
  ["AHM", "Ahmedabad"],
  ["PUN", "Pune"],
  ["JAI", "Jaipur"],
  ["LKN", "Lucknow"],
  ["SRT", "Surat"],
  ["NAG", "Nagpur"],
  ["IND", "Indore"],
  ["BHO", "Bhopal"],
  ["PAT", "Patna"],
  ["CHD", "Chandigarh"],
  ["0000", "Main Branch"],
  ["0001", "New Delhi"],
  ["0002", "Mumbai"],
  ["0003", "Kolkata"],
  ["0004", "Chennai"],
  ["0005", "Bangalore"],
  ["0006", "Hyderabad"],
  ["0007", "Ahmedabad"],
  ["0008", "Pune"],
  ["0009", "Jaipur"],
  ["0010", "Lucknow"],
];

function getBranchFromIFSC(ifsc: string): string {
  if (!ifsc || ifsc.length < 6) return ifsc || "";
  const prefix = ifsc.slice(0, 4).toUpperCase();
  const branch = ifsc.slice(5).toUpperCase();
  const bankName = BANK_MAP[prefix] ?? `${prefix} Bank`;
  let city = "";
  for (const [code, cityName] of CITY_HINTS) {
    if (branch.startsWith(code)) {
      city = cityName;
      break;
    }
  }
  if (!city) city = `${branch.slice(0, 3)} Branch`;
  return `${bankName}, ${city}`;
}

function strHash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return h;
}

function getUsdtNetworkFee(amount: number): string {
  if (amount < 10) return "1 USDT";
  if (amount < 100) return "2 USDT";
  if (amount < 1000) return "3 USDT";
  return "5 USDT";
}

function getStatusLabel(method: string, transferMode?: string): string {
  const m = method?.toLowerCase();
  if (m === "bank") {
    if (transferMode === "NEFT" || transferMode === "RTGS") return "SETTLED";
    return "COMPLETE";
  }
  return "COMPLETE";
}

type ReceiptRow = { key: string; value: string; copyable?: boolean };

function buildRows(
  w: WithdrawalData,
  d: Record<string, string>,
  fmtDate: string,
  fmtTime: string,
): ReceiptRow[] {
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
  const branchName = getBranchFromIFSC(d.ifsc || "");
  const transferMode = d.transferMode || "IMPS";
  const amount = `\u20b9${w.amount.toLocaleString("en-IN")}`;
  const method = w.method?.toLowerCase();

  if (method === "upi") {
    const status = getStatusLabel("upi");
    return [
      { key: "UTR Number", value: utr12, copyable: true },
      { key: "Transaction ID", value: txnId, copyable: true },
      { key: "UPI Ref No", value: upiRef, copyable: true },
      { key: "VPA / UPI ID", value: d.upiId || d.upiAddress || "---" },
      { key: "Amount", value: amount },
      { key: "Date", value: fmtDate },
      { key: "Time", value: fmtTime },
      { key: "Status", value: status },
    ];
  }

  if (method === "usdt") {
    const usdtAmount = w.amount;
    const inrEquiv = (usdtAmount * 85).toLocaleString("en-IN");
    const hashHex = cleanId.padEnd(64, "0").slice(0, 64).toLowerCase();
    const txHash = `0x${hashHex}`;
    const networkFee = getUsdtNetworkFee(usdtAmount);
    const confirmations = (strHash(w.id) % 15) + 1;
    return [
      { key: "Wallet TXN Hash", value: txHash, copyable: true },
      { key: "Network", value: "TRON (TRC20)" },
      { key: "Wallet Address", value: d.usdtAddress || "---", copyable: true },
      {
        key: "USDT Amount",
        value: `${usdtAmount.toLocaleString("en-IN")} USDT`,
      },
      { key: "\u2248 INR", value: `\u2248 \u20b9${inrEquiv}` },
      { key: "Network Fee", value: networkFee },
      { key: "Confirmations", value: `${confirmations}/15` },
      { key: "Date", value: fmtDate },
      { key: "Time", value: fmtTime },
      { key: "Status", value: "COMPLETE" },
    ];
  }

  // Bank transfer
  const isIMPS = transferMode === "IMPS";
  const status = getStatusLabel("bank", transferMode);
  return [
    { key: "UTR Number", value: utr12, copyable: true },
    { key: "Transaction ID", value: txnId, copyable: true },
    {
      key: isIMPS ? "RRN / IMPS Ref No" : "RRN Number",
      value: isIMPS ? rrn12 : rrn16,
      copyable: true,
    },
    { key: "Account Number", value: maskedAcc },
    { key: "IFSC Code", value: d.ifsc || "---" },
    {
      key: "Account Holder",
      value: d.accountHolderName || d.accountHolder || "---",
    },
    { key: "Bank Name", value: d.bankName || "---" },
    { key: "Branch Name", value: branchName },
    { key: "Transfer Mode", value: transferMode },
    { key: "Amount", value: amount },
    { key: "Date", value: fmtDate },
    { key: "Time", value: fmtTime },
    { key: "Status", value: status },
  ];
}

function generateReceiptHTML(
  w: WithdrawalData,
  d: Record<string, string>,
  fmtDate: string,
  fmtTime: string,
) {
  const rows = buildRows(w, d, fmtDate, fmtTime);
  const rowsHTML = rows
    .map(
      (r) =>
        `<div class="row"><span class="label">${r.key}</span><span class="val" style="${
          r.key === "Status"
            ? "color:#16a34a"
            : r.key === "Amount" || r.key === "USDT Amount"
              ? "color:#d4a017"
              : ""
        }">${r.value}</span></div>`,
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Withdrawal Receipt \u2014 KUBER PANEL</title>
<style>body{font-family:'DM Sans',Arial,sans-serif;max-width:420px;margin:40px auto;padding:24px;background:#0a0f1e;color:#e2e8f0;border:1px solid #1e3a5f;border-radius:12px;}
h2{text-align:center;color:#60a5fa;letter-spacing:4px;margin-bottom:4px;} .sub{text-align:center;color:#64748b;font-size:12px;margin-bottom:12px;} .badge{text-align:center;background:rgba(22,163,74,0.15);color:#4ade80;padding:4px 16px;border-radius:20px;display:block;font-weight:bold;margin:8px auto 16px;border:1px solid rgba(22,163,74,0.35);} .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px;} .label{color:#64748b;} .val{font-weight:600;text-align:right;max-width:58%;word-break:break-all;} .footer{text-align:center;color:#374151;font-size:10px;margin-top:16px;}
</style></head><body>
<h2>KUBER PANEL</h2><p class="sub">Withdrawal Receipt</p><div class="badge">\u2714 Transaction Successful</div>
${rowsHTML}
<div class="footer">This is a computer-generated receipt. KUBER PANEL Official Platform.</div>
</body></html>`;
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handle}
      title="Copy"
      className="ml-1.5 p-1 rounded transition-colors flex-shrink-0"
      style={{
        color: copied ? "#4ade80" : "#6b7280",
        background: "transparent",
      }}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
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
  const fmtTime = (n: bigint) => fmtTimeUpper(new Date(Number(n) / 1_000_000));

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
    a.download = `receipt-${w.id.replace(/-/g, "").slice(0, 12).toUpperCase()}.html`;
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
                    {w.method?.toLowerCase() === "usdt"
                      ? `${w.amount.toLocaleString("en-IN")} USDT`
                      : `\u20b9${w.amount.toLocaleString("en-IN")}`}
                  </td>
                  <td className="px-4 py-3 text-xs text-white uppercase whitespace-nowrap">
                    {w.method}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400 whitespace-nowrap">
                    {w.utrNumber ||
                      `UTR${w.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const d = parseDetails(w.methodDetails);
                      const label = getStatusLabel(
                        w.method || "",
                        d.transferMode,
                      );
                      const isSettled = label === "SETTLED";
                      return (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            background: isSettled
                              ? "oklch(0.7 0.18 50 / 15%)"
                              : "oklch(0.6 0.2 145 / 15%)",
                            color: isSettled
                              ? "oklch(0.78 0.18 50)"
                              : "oklch(0.72 0.2 145)",
                          }}
                        >
                          {label}
                        </span>
                      );
                    })()}
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
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.12 0.02 220), oklch(0.10 0.01 220))",
                borderBottom: "1px solid oklch(0.65 0.2 220 / 20%)",
              }}
            >
              <div>
                <div className="font-black text-base tracking-widest shimmer-text">
                  KUBER PANEL
                </div>
                <div className="text-[11px] text-gray-500">
                  Withdrawal Receipt
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

            {/* Transaction Successful badge */}
            <div
              className="text-center py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid oklch(0.65 0.2 220 / 15%)" }}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" style={{ color: "#4ade80" }} />
                <span
                  className="text-sm font-black tracking-wide"
                  style={{ color: "#4ade80" }}
                >
                  Transaction Successful
                </span>
              </div>
            </div>

            {/* Receipt rows with copy buttons */}
            <div className="flex-1 overflow-y-auto px-5 py-2">
              {(() => {
                const d = parseDetails(selected.methodDetails);
                const rows = buildRows(
                  selected,
                  d,
                  fmtDate(selected.createdAt),
                  fmtTime(selected.createdAt),
                );
                return rows.map((row) => {
                  const isStatus = row.key === "Status";
                  const isAmount =
                    row.key === "Amount" || row.key === "USDT Amount";
                  const isSettled = row.value === "SETTLED";
                  return (
                    <div
                      key={row.key}
                      className="flex justify-between items-center py-3"
                      style={{
                        borderBottom: "1px solid oklch(0.65 0.2 220 / 8%)",
                      }}
                    >
                      <span className="text-[12px] text-gray-500 flex-shrink-0 mr-4">
                        {row.key}
                      </span>
                      <div className="flex items-center gap-1 min-w-0">
                        <span
                          className="text-[12px] font-semibold text-right break-all"
                          style={{
                            color: isStatus
                              ? isSettled
                                ? "oklch(0.78 0.18 50)"
                                : "oklch(0.72 0.2 145)"
                              : isAmount
                                ? "oklch(0.82 0.17 85)"
                                : "white",
                          }}
                        >
                          {isStatus && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black"
                              style={{
                                background: isSettled
                                  ? "oklch(0.7 0.18 50 / 18%)"
                                  : "oklch(0.6 0.2 145 / 18%)",
                                color: isSettled
                                  ? "oklch(0.78 0.18 50)"
                                  : "oklch(0.72 0.2 145)",
                                border: `1px solid ${
                                  isSettled
                                    ? "oklch(0.7 0.18 50 / 35%)"
                                    : "oklch(0.6 0.2 145 / 35%)"
                                }`,
                              }}
                            >
                              {!isSettled && (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {row.value}
                            </span>
                          )}
                          {!isStatus && row.value}
                        </span>
                        {row.copyable && !isStatus && (
                          <CopyBtn value={row.value} />
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
              <div
                className="text-center py-4 text-[10px]"
                style={{ color: "oklch(0.35 0 0)" }}
              >
                This is a computer-generated receipt. KUBER PANEL Official
                Platform.
              </div>
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
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.2 240), oklch(0.45 0.2 270))",
                }}
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
