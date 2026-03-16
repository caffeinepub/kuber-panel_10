import { Download, FileText, Printer } from "lucide-react";
import { useApp } from "../../context/AppContext";
import * as LocalStore from "../../utils/LocalStore";

const fundLabels: Record<string, string> = {
  gaming: "Gaming",
  stock: "Stock",
  mix: "Mix",
  political: "Political",
  all: "All",
};

export default function BankStatement() {
  const { isAdmin } = useApp();

  // Get completed session bank statement entries (saved when fund is turned OFF)
  const stmtHistory = LocalStore.getBankStatementHistory();

  // Group by bank for a summary
  const bankMap: Record<string, LocalStore.BankStatementEntry[]> = {};
  for (const entry of stmtHistory) {
    if (!bankMap[entry.bankId]) bankMap[entry.bankId] = [];
    bankMap[entry.bankId].push(entry);
  }

  const handlePrint = () => window.print();
  const handleDownload = () => {
    const rows = [
      [
        "Date",
        "Time",
        "Bank",
        "Account No.",
        "IFSC",
        "UTR Number",
        "Fund",
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
        fundLabels[e.fundType] ?? e.fundType,
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

  return (
    <div className="space-y-6" id="bank-statement-print">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold gold-text">Bank Statement</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            All completed live fund session transactions
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
            onClick={handleDownload}
            data-ocid="bank_statement.download_button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#60a5fa",
            }}
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
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
        <>
          {/* Bank-wise summary */}
          {Object.entries(bankMap).map(([bankId, entries], bi) => {
            const bankName = entries[0].bankName;
            const acNo = entries[0].accountNumber;
            const ifsc = entries[0].ifscCode;
            const holder = entries[0].accountHolderName;
            const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
            const totalDebit = entries.reduce((s, e) => s + e.debit, 0);

            return (
              <div
                key={bankId}
                data-ocid={`bank_statement.bank.${bi + 1}`}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(212,160,23,0.2)" }}
              >
                {/* Bank header */}
                <div
                  className="px-5 py-4"
                  style={{
                    background: "rgba(212,160,23,0.08)",
                    borderBottom: "1px solid rgba(212,160,23,0.15)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-black text-white text-base uppercase">
                        {bankName}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Holder: {holder}
                      </div>
                      <div className="text-xs text-gray-500">
                        A/C: {acNo} &nbsp;|&nbsp; IFSC: {ifsc}
                      </div>
                      {entries[0].mobileNumber && (
                        <div className="text-xs text-gray-600">
                          Mobile: {entries[0].mobileNumber}
                        </div>
                      )}
                      {entries[0].upiId && (
                        <div className="text-xs text-gray-600">
                          UPI: {entries[0].upiId}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">
                        Total Credit
                      </div>
                      <div className="font-black text-green-400 text-sm">
                        +₹{totalCredit.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 mb-1">
                        Total Debit
                      </div>
                      <div className="font-black text-red-400 text-sm">
                        -₹{totalDebit.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions table */}
                <div className="overflow-x-auto">
                  <table
                    className="w-full"
                    data-ocid={`bank_statement.table.${bi + 1}`}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid rgba(212,160,23,0.12)",
                        }}
                      >
                        {[
                          "Date",
                          "Time",
                          "UTR Number",
                          "Fund",
                          "Credit (₹)",
                          "Debit (₹)",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider"
                            style={{ color: "#d4a017", background: "#080808" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e, i) => (
                        <tr
                          key={e.id}
                          data-ocid={`bank_statement.item.${i + 1}`}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            background: i % 2 === 0 ? "#060606" : "#030303",
                          }}
                        >
                          <td className="px-4 py-2.5 text-xs text-gray-300">
                            {e.date}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-400">
                            {e.time}
                          </td>
                          <td className="px-4 py-2.5 text-xs font-mono text-gray-400">
                            {e.utrNumber}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase gold-text"
                              style={{ background: "rgba(212,160,23,0.1)" }}
                            >
                              {fundLabels[e.fundType] ?? e.fundType}
                            </span>
                          </td>
                          <td
                            className="px-4 py-2.5 text-xs font-bold"
                            style={{ color: e.credit > 0 ? "#4ade80" : "#333" }}
                          >
                            {e.credit > 0
                              ? `+${e.credit.toLocaleString("en-IN")}`
                              : "-"}
                          </td>
                          <td
                            className="px-4 py-2.5 text-xs font-bold"
                            style={{ color: e.debit > 0 ? "#f87171" : "#333" }}
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
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
