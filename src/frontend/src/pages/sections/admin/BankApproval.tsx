import { CheckCircle, Clock, Eye, Trash2, X, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { BankAccountData } from "../../../backend";
import { useApp } from "../../../context/AppContext";
import { useActor } from "../../../hooks/useActor";

type Tab = "pending" | "approved" | "rejected";

export default function BankApproval() {
  const { allBankAccounts, refresh } = useApp();
  const { actor } = useActor();
  const [tab, setTab] = useState<Tab>("pending");
  const [viewBank, setViewBank] = useState<BankAccountData | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const filtered = allBankAccounts.filter((b) => b.status === tab);
  const fmtDate = (n: bigint) =>
    new Date(Number(n) / 1_000_000).toLocaleDateString("en-IN");
  const fmtTime = (n: bigint) =>
    new Date(Number(n) / 1_000_000).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "delete",
  ) => {
    if (!actor) return;
    if (action === "delete" && !confirm("Delete this bank account?")) return;
    setActing(id);
    try {
      if (action === "approve") await actor.approveBankAccount(id);
      else if (action === "reject") await actor.rejectBankAccount(id);
      else await actor.deleteBankAccount(id);
      toast.success(`Bank account ${action}d`);
      refresh();
    } catch {
      toast.error(`Failed to ${action}`);
    } finally {
      setActing(null);
    }
  };

  const tabCounts = {
    pending: allBankAccounts.filter((b) => b.status === "pending").length,
    approved: allBankAccounts.filter((b) => b.status === "approved").length,
    rejected: allBankAccounts.filter((b) => b.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gold-text">Bank Account Approval</h2>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["pending", "approved", "rejected"] as Tab[]).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTab(t)}
            data-ocid={`bank_approval.${t}.tab`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t
                ? "gold-gradient text-black"
                : "text-gray-400 hover:text-white"
            }`}
            style={tab !== t ? { background: "oklch(0.12 0 0)" } : {}}
          >
            {t === "pending" && <Clock className="w-3.5 h-3.5" />}
            {t === "approved" && <CheckCircle className="w-3.5 h-3.5" />}
            {t === "rejected" && <XCircle className="w-3.5 h-3.5" />}
            <span className="capitalize">{t}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs ${
                tab === t
                  ? "bg-black/20 text-black"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              {tabCounts[t]}
            </span>
          </button>
        ))}
      </div>

      <div className="dark-card rounded-xl overflow-hidden">
        <table className="w-full" data-ocid="bank_approval.table">
          <thead>
            <tr style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}>
              {[
                "Bank Name",
                "Account Holder",
                "Account Number",
                "Date",
                "Time",
                "Actions",
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
            {filtered.length === 0 && (
              <tr data-ocid="bank_approval.empty_state">
                <td colSpan={6} className="text-center py-10 text-gray-600">
                  No {tab} accounts
                </td>
              </tr>
            )}
            {filtered.map((b, i) => (
              <tr
                key={b.id}
                data-ocid={`bank_approval.item.${i + 1}`}
                className="table-row-hover"
                style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)" }}
              >
                <td className="px-4 py-3 text-sm font-semibold text-white">
                  {b.bankName}
                </td>
                <td className="px-4 py-3 text-xs text-gray-300">
                  {b.accountHolderName}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-gray-400">
                  {b.accountNumber}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {fmtDate(b.createdAt)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {fmtTime(b.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewBank(b)}
                      data-ocid={`bank_approval.view.button.${i + 1}`}
                      className="p-1.5 rounded-lg"
                      style={{ background: "oklch(0.14 0 0)" }}
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    {tab === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(b.id, "approve")}
                          disabled={acting === b.id}
                          data-ocid={`bank_approval.approve_button.${i + 1}`}
                          className="p-1.5 rounded-lg"
                          style={{ background: "oklch(0.6 0.2 145 / 15%)" }}
                        >
                          <CheckCircle
                            className="w-3.5 h-3.5"
                            style={{ color: "oklch(0.7 0.2 145)" }}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(b.id, "reject")}
                          disabled={acting === b.id}
                          data-ocid={`bank_approval.reject_button.${i + 1}`}
                          className="p-1.5 rounded-lg"
                          style={{ background: "oklch(0.6 0.2 25 / 15%)" }}
                        >
                          <XCircle
                            className="w-3.5 h-3.5"
                            style={{ color: "oklch(0.65 0.2 25)" }}
                          />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAction(b.id, "delete")}
                      disabled={acting === b.id}
                      data-ocid={`bank_approval.delete_button.${i + 1}`}
                      className="p-1.5 rounded-lg"
                      style={{ background: "oklch(0.6 0.2 25 / 10%)" }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewBank && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0 0 0 / 80%)" }}
          data-ocid="bank_approval.dialog"
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{
              background: "oklch(0.1 0 0)",
              border: "1px solid oklch(0.75 0.15 85 / 30%)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white">Bank Account Details</h3>
              <button
                type="button"
                onClick={() => setViewBank(null)}
                data-ocid="bank_approval.close_button"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries({
                "Bank Name": viewBank.bankName,
                "Account Type": viewBank.accountType,
                "Account Holder": viewBank.accountHolderName,
                "Account Number": viewBank.accountNumber,
                "IFSC Code": viewBank.ifscCode,
                Mobile: viewBank.mobileNumber,
                "UPI ID": viewBank.upiId,
                "IB ID": viewBank.internetBankingId,
                Status: viewBank.status,
              }).map(
                ([k, v]) =>
                  v && (
                    <div
                      key={k}
                      className="flex justify-between py-1.5"
                      style={{
                        borderBottom: "1px solid oklch(0.75 0.15 85 / 10%)",
                      }}
                    >
                      <span className="text-xs text-gray-500">{k}</span>
                      <span className="text-xs text-white font-medium capitalize">
                        {v}
                      </span>
                    </div>
                  ),
              )}
            </div>
            {viewBank.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    handleAction(viewBank.id, "approve");
                    setViewBank(null);
                  }}
                  data-ocid="bank_approval.confirm_button"
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-black gold-gradient"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAction(viewBank.id, "reject");
                    setViewBank(null);
                  }}
                  data-ocid="bank_approval.cancel_button"
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-red-400"
                  style={{ background: "oklch(0.6 0.2 25 / 15%)" }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
