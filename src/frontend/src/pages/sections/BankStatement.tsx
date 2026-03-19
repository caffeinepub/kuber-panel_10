import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Printer,
  Search,
} from "lucide-react";
import { useState } from "react";
import BankLogo from "../../components/BankLogo";
import { useApp } from "../../context/AppContext";
import * as LocalStore from "../../utils/LocalStore";
import { fmtDateTimeUpper } from "../../utils/timeUtils";

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
  FDRL: "Federal Bank",
  KARB: "Karnataka Bank",
};

function getBranchFromIFSC(ifsc: string): string {
  if (!ifsc || ifsc.length < 6) return "";
  const prefix = ifsc.slice(0, 4).toUpperCase();
  const branch = ifsc.slice(5).toUpperCase();
  const bankName = BANK_MAP[prefix] ?? `${prefix} Bank`;
  const cityHints: [string, string][] = [
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
  ];
  for (const [code, city] of cityHints) {
    if (branch.startsWith(code)) return `${bankName}, ${city} Branch`;
  }
  return `${bankName}, ${branch.slice(0, 5)} Branch`;
}

function CopyUTR({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy UTR"
      className="p-1 rounded transition-colors flex-shrink-0"
      style={{
        color: copied ? "#4ade80" : "#4b5563",
        background: "transparent",
      }}
      onClick={() => {
        navigator.clipboard.writeText(value).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function BankStatement() {
  const { isAdmin } = useApp();
  const [expandedSessions, setExpandedSessions] = useState<
    Record<string, boolean>
  >({});
  const [search, setSearch] = useState("");

  const toggleSession = (key: string) => {
    setExpandedSessions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const stmtHistory = LocalStore.getBankStatementHistory();

  // Group: bankId → sessionId → entries[]
  const bankSessionMap: Record<
    string,
    Record<string, LocalStore.BankStatementEntry[]>
  > = {};
  for (const entry of stmtHistory) {
    const bid = entry.bankId;
    const sid = entry.sessionId ?? `legacy_${entry.fundType}_${entry.date}`;
    if (!bankSessionMap[bid]) bankSessionMap[bid] = {};
    if (!bankSessionMap[bid][sid]) bankSessionMap[bid][sid] = [];
    bankSessionMap[bid][sid].push(entry);
  }

  const handlePrint = () => window.print();

  const handleDownloadAll = () => {
    const rows = [
      [
        "Date",
        "Time",
        "Bank",
        "Account No.",
        "IFSC",
        "UTR Number",
        "Credit (INR)",
        "Debit (INR)",
      ],
      ...stmtHistory.map((e) => [
        e.date,
        e.time,
        e.bankName,
        e.accountNumber,
        e.ifscCode,
        e.utrNumber,
        e.credit > 0 ? e.credit : "",
        e.debit > 0 ? e.debit : "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kuber_panel_statement.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download a single session as HTML/PDF-printable
  const handleDownloadSession = (
    entries: LocalStore.BankStatementEntry[],
    bankName: string,
    accountNumber: string,
    ifscCode: string,
    holderName: string,
    sessionStart?: string,
    sessionEnd?: string,
  ) => {
    const branch = getBranchFromIFSC(ifscCode);
    const rowsHTML = entries
      .map(
        (e) =>
          `<tr style="border-bottom:1px solid #111">
          <td style="padding:6px 8px;font-size:11px;color:#9ca3af">${e.date}</td>
          <td style="padding:6px 8px;font-size:11px;color:#9ca3af">${e.time}</td>
          <td style="padding:6px 8px;font-size:10px;font-family:monospace;color:#9ca3af">${e.utrNumber}</td>
          <td style="padding:6px 8px;font-size:11px;color:${e.credit > 0 ? "#4ade80" : "#333"}">${e.credit > 0 ? `+\u20b9${e.credit.toLocaleString("en-IN")}` : "-"}</td>
          <td style="padding:6px 8px;font-size:11px;color:${e.debit > 0 ? "#f87171" : "#333"}">${e.debit > 0 ? `-\u20b9${e.debit.toLocaleString("en-IN")}` : "-"}</td>
        </tr>`,
      )
      .join("");
    const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
    const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bank Statement \u2014 KUBER PANEL</title>
<style>body{font-family:'DM Sans',Arial,sans-serif;max-width:700px;margin:30px auto;padding:24px;background:#050505;color:#e2e8f0;} h2{color:#d4a017;letter-spacing:3px;margin-bottom:4px;} .sub{color:#64748b;font-size:12px;margin-bottom:16px;} table{width:100%;border-collapse:collapse;} th{padding:8px;font-size:10px;color:#d4a017;text-align:left;border-bottom:1px solid rgba(212,160,23,0.2);background:#080808;} .footer{text-align:center;color:#374151;font-size:10px;margin-top:20px;}</style></head>
<body>
<h2>KUBER PANEL</h2><p class="sub">Bank Statement</p>
<div style="background:#0d0d0d;border:1px solid rgba(212,160,23,0.2);border-radius:8px;padding:16px;margin-bottom:16px;font-size:12px;">
  <div><strong style="color:#d4a017">${bankName}</strong></div>
  <div style="color:#9ca3af">A/C: ${accountNumber} &nbsp;|&nbsp; IFSC: ${ifscCode}</div>
  <div style="color:#9ca3af">Holder: ${holderName}</div>
  <div style="color:#9ca3af">Branch: ${branch}</div>
  ${sessionStart ? `<div style="color:#9ca3af;margin-top:6px">Fund ON: ${fmtDateTimeUpper(sessionStart)}</div>` : ""}
  ${sessionEnd ? `<div style="color:#9ca3af">Fund OFF: ${fmtDateTimeUpper(sessionEnd)}</div>` : ""}
  <div style="margin-top:8px"><span style="color:#4ade80">Total Credit: +\u20b9${totalCredit.toLocaleString("en-IN")}</span> &nbsp;|&nbsp; <span style="color:#f87171">Total Debit: -\u20b9${totalDebit.toLocaleString("en-IN")}</span></div>
</div>
<table><thead><tr><th>Date</th><th>Time</th><th>UTR Number</th><th>Credit (\u20b9)</th><th>Debit (\u20b9)</th></tr></thead><tbody>${rowsHTML}</tbody></table>
<div class="footer">KUBER PANEL \u00b7 Computer-generated statement</div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement-${bankName.replace(/\s/g, "-").slice(0, 12)}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold gold-text">Bank Statement</h2>
        <div className="dark-card rounded-xl p-10 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-gray-700" />
          <p className="text-gray-600 text-sm">
            Bank statement not available for your account.
          </p>
        </div>
      </div>
    );
  }

  // Filter entries by search
  const lowerSearch = search.toLowerCase();
  const filterEntry = (e: LocalStore.BankStatementEntry) => {
    if (!lowerSearch) return true;
    return (
      e.bankName.toLowerCase().includes(lowerSearch) ||
      e.accountNumber.includes(lowerSearch) ||
      e.utrNumber.includes(lowerSearch) ||
      e.date.includes(lowerSearch) ||
      String(e.credit).includes(lowerSearch) ||
      String(e.debit).includes(lowerSearch)
    );
  };

  return (
    <div className="space-y-5" id="bank-statement-print">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold gold-text">Bank Statement</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Per-session Bank statements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            data-ocid="bank_statement.print_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{
              background: "rgba(212,160,23,0.12)",
              border: "1px solid rgba(212,160,23,0.3)",
              color: "#d4a017",
            }}
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            type="button"
            onClick={handleDownloadAll}
            data-ocid="bank_statement.download_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#60a5fa",
            }}
          >
            <Download className="w-3.5 h-3.5" /> Download All
          </button>
        </div>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{
          background: "oklch(0.1 0 0)",
          border: "1px solid oklch(0.75 0.15 85 / 15%)",
        }}
      >
        <Search
          className="w-4 h-4 flex-shrink-0"
          style={{ color: "#4b5563" }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by bank, account, UTR, date, amount..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
          data-ocid="bank_statement.search"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-gray-600 hover:text-white"
          >
            \u00d7
          </button>
        )}
      </div>

      {stmtHistory.length === 0 ? (
        <div
          data-ocid="bank_statement.empty_state"
          className="dark-card rounded-xl p-12 text-center"
        >
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <p className="text-gray-600 text-sm">No statement entries yet.</p>
          <p className="text-gray-700 text-xs mt-1">
            Turn ON a fund and turn it OFF to generate statements.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(bankSessionMap).map(([bankId, sessionMap], bi) => {
            const firstSession = Object.values(sessionMap)[0];
            if (!firstSession?.length) return null;
            const bankInfo = firstSession[0];

            const allEntries = Object.values(sessionMap).flat();
            const totalCredit = allEntries.reduce((s, e) => s + e.credit, 0);
            const totalDebit = allEntries.reduce((s, e) => s + e.debit, 0);
            const branch = getBranchFromIFSC(bankInfo.ifscCode || "");

            return (
              <div
                key={bankId}
                data-ocid={`bank_statement.bank.${bi + 1}`}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(212,160,23,0.18)" }}
              >
                {/* Bank header */}
                <div
                  className="px-4 py-4"
                  style={{
                    background: "rgba(212,160,23,0.06)",
                    borderBottom: "1px solid rgba(212,160,23,0.12)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <BankLogo bankName={bankInfo.bankName} size={36} />
                        <div>
                          <div className="font-black text-white text-sm uppercase">
                            {bankInfo.bankName}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {bankInfo.accountHolderName}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                        <div className="text-[10px] text-gray-500">
                          <span className="text-gray-600">A/C: </span>
                          {bankInfo.accountNumber}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          <span className="text-gray-600">IFSC: </span>
                          {bankInfo.ifscCode}
                        </div>
                        {branch && (
                          <div
                            className="text-[10px] text-gray-500 col-span-2"
                            style={{ marginTop: "1px" }}
                          >
                            <span className="text-gray-600">Branch: </span>
                            {branch}
                          </div>
                        )}
                        {bankInfo.mobileNumber && (
                          <div className="text-[10px] text-gray-500">
                            <span className="text-gray-600">Mobile: </span>
                            {bankInfo.mobileNumber}
                          </div>
                        )}
                        {bankInfo.upiId && (
                          <div className="text-[10px] text-gray-500">
                            <span className="text-gray-600">UPI: </span>
                            {bankInfo.upiId}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] text-gray-600 mb-0.5">
                        Total Credit
                      </div>
                      <div className="font-black text-green-400 text-sm">
                        +\u20b9{totalCredit.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-2 mb-0.5">
                        Total Debit
                      </div>
                      <div className="font-black text-red-400 text-sm">
                        -\u20b9{totalDebit.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session blocks */}
                {Object.entries(sessionMap).map(([sid, entries], si) => {
                  const filteredEntries = entries.filter(filterEntry);
                  if (search && filteredEntries.length === 0) return null;

                  const sessionCredit = entries.reduce(
                    (s, e) => s + e.credit,
                    0,
                  );
                  const sessionDebit = entries.reduce((s, e) => s + e.debit, 0);
                  const startTime = entries[0]?.sessionStartTime;
                  const endTime = entries[0]?.sessionEndTime;
                  const sessionKey = `${bankId}_${sid}`;
                  const isExpanded = expandedSessions[sessionKey] ?? false;
                  const displayEntries = search ? filteredEntries : entries;

                  return (
                    <div
                      key={sid}
                      data-ocid={`bank_statement.session.${si + 1}`}
                      style={{
                        borderTop:
                          si > 0
                            ? "1px solid rgba(212,160,23,0.08)"
                            : undefined,
                      }}
                    >
                      {/* Session header card */}
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
                        style={{
                          background: isExpanded
                            ? "rgba(255,255,255,0.03)"
                            : "transparent",
                        }}
                        onClick={() => toggleSession(sessionKey)}
                        data-ocid={`bank_statement.session_toggle.${si + 1}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white font-semibold mb-0.5">
                            {bankInfo.bankName}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            A/C: {bankInfo.accountNumber}
                          </div>
                          {bankInfo.ifscCode && (
                            <div className="text-[10px] text-gray-600">
                              IFSC: {bankInfo.ifscCode}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            {startTime && (
                              <div>
                                <div className="text-[9px] text-gray-700 uppercase tracking-wider">
                                  Fund ON
                                </div>
                                <div className="text-[10px] text-green-500 font-semibold">
                                  {fmtDateTimeUpper(startTime)}
                                </div>
                              </div>
                            )}
                            {endTime && (
                              <div>
                                <div className="text-[9px] text-gray-700 uppercase tracking-wider">
                                  Fund OFF
                                </div>
                                <div className="text-[10px] text-red-400 font-semibold">
                                  {fmtDateTimeUpper(endTime)}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-600 mt-1">
                            {entries.length} transactions
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-[10px] font-bold">
                              <span className="text-green-400">
                                +\u20b9{sessionCredit.toLocaleString("en-IN")}
                              </span>
                              {" / "}
                              <span className="text-red-400">
                                -\u20b9{sessionDebit.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                          <div style={{ color: "#d4a017" }}>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded transactions */}
                      {isExpanded && (
                        <div>
                          <div className="overflow-x-auto">
                            <table
                              className="w-full"
                              data-ocid={`bank_statement.table.${bi + 1}.${si + 1}`}
                            >
                              <thead>
                                <tr
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(212,160,23,0.1)",
                                  }}
                                >
                                  {[
                                    "Date",
                                    "Time",
                                    "UTR Number",
                                    "Credit (\u20b9)",
                                    "Debit (\u20b9)",
                                  ].map((h) => (
                                    <th
                                      key={h}
                                      className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider"
                                      style={{
                                        color: "#d4a017",
                                        background: "#060606",
                                      }}
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {displayEntries.map((e, i) => (
                                  <tr
                                    key={e.id}
                                    data-ocid={`bank_statement.item.${i + 1}`}
                                    style={{
                                      borderBottom:
                                        "1px solid rgba(255,255,255,0.03)",
                                      background:
                                        i % 2 === 0 ? "#040404" : "#020202",
                                    }}
                                  >
                                    <td className="px-4 py-2 text-xs text-gray-400">
                                      {e.date}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-gray-500">
                                      {e.time.replace(/\b(am|pm)\b/gi, (m) =>
                                        m.toUpperCase(),
                                      )}
                                    </td>
                                    <td className="px-4 py-2">
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs font-mono text-gray-500">
                                          {e.utrNumber}
                                        </span>
                                        <CopyUTR value={e.utrNumber} />
                                      </div>
                                    </td>
                                    <td
                                      className="px-4 py-2 text-xs font-bold"
                                      style={{
                                        color:
                                          e.credit > 0 ? "#4ade80" : "#222",
                                      }}
                                    >
                                      {e.credit > 0
                                        ? `+${e.credit.toLocaleString("en-IN")}`
                                        : "-"}
                                    </td>
                                    <td
                                      className="px-4 py-2 text-xs font-bold"
                                      style={{
                                        color: e.debit > 0 ? "#f87171" : "#222",
                                      }}
                                    >
                                      {e.debit > 0
                                        ? `-${e.debit.toLocaleString("en-IN")}`
                                        : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Download this session */}
                          <div
                            className="px-4 py-3"
                            style={{
                              borderTop: "1px solid rgba(255,255,255,0.04)",
                              background: "#030303",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadSession(
                                  entries,
                                  bankInfo.bankName,
                                  bankInfo.accountNumber,
                                  bankInfo.ifscCode || "",
                                  bankInfo.accountHolderName || "",
                                  startTime,
                                  endTime,
                                )
                              }
                              data-ocid={`bank_statement.download_session.${si + 1}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold w-full justify-center"
                              style={{
                                background: "rgba(59,130,246,0.08)",
                                border: "1px solid rgba(59,130,246,0.2)",
                                color: "#60a5fa",
                              }}
                            >
                              <Download className="w-3.5 h-3.5" /> Download
                              Statement (PDF)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
