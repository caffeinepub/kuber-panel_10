import {
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as LocalStore from "../../../utils/LocalStore";
import type { BankAccountLS } from "../../../utils/LocalStore";

type Tab = "pending" | "approved" | "rejected";

export default function BankApproval() {
  const [_refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState<Tab>("pending");
  const [viewBank, setViewBank] = useState<BankAccountLS | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const allBanks = LocalStore.getBankAccounts();
  const filtered = allBanks.filter((b) => b.status === tab);
  const tabCounts = {
    pending: allBanks.filter((b) => b.status === "pending").length,
    approved: allBanks.filter((b) => b.status === "approved").length,
    rejected: allBanks.filter((b) => b.status === "rejected").length,
  };

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleAction = (
    id: string,
    action: "approve" | "reject" | "delete",
  ) => {
    if (action === "delete" && !confirm("Delete this bank account?")) return;
    setActing(id);
    setTimeout(() => {
      try {
        if (action === "approve") LocalStore.approveBankAccount(id);
        else if (action === "reject") LocalStore.rejectBankAccount(id);
        else LocalStore.deleteBankAccount(id);
        toast.success(`Bank account ${action}d`);
        if (viewBank?.id === id) setViewBank(null);
        triggerRefresh();
      } catch {
        toast.error(`Failed to ${action}`);
      } finally {
        setActing(null);
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold gold-text">Bank Account Approval</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve user bank accounts
        </p>
      </div>

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
        {filtered.length === 0 ? (
          <div
            data-ocid="bank_approval.empty_state"
            className="py-10 text-center text-gray-600 text-sm"
          >
            No {tab} bank accounts
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-ocid="bank_approval.table">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)",
                  }}
                >
                  {[
                    "User",
                    "Bank Name",
                    "Account Holder",
                    "Account #",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider gold-text"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr
                    key={b.id}
                    data-ocid={`bank_approval.item.${i + 1}`}
                    className="table-row-hover"
                    style={{
                      borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)",
                    }}
                  >
                    <td className="px-3 py-3">
                      <span className="text-[11px] text-gray-400 break-all">
                        {b.userId}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-semibold text-white">
                        {b.bankName}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-gray-300">
                        {b.accountHolderName}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono text-gray-400">
                        ****{b.accountNumber.slice(-4)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-gray-500">
                        {fmtDate(b.createdAt)}
                      </div>
                      <div className="text-[10px] text-gray-700">
                        {fmtTime(b.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        {acting === b.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setViewBank(b)}
                              data-ocid={`bank_approval.view.button.${i + 1}`}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-white"
                              style={{ background: "oklch(0.14 0 0)" }}
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {tab === "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAction(b.id, "approve")}
                                  data-ocid={`bank_approval.approve_button.${i + 1}`}
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{
                                    background: "oklch(0.6 0.2 145 / 12%)",
                                    color: "oklch(0.7 0.2 145)",
                                  }}
                                  title="Approve"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAction(b.id, "reject")}
                                  data-ocid={`bank_approval.reject_button.${i + 1}`}
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{
                                    background: "oklch(0.5 0.2 25 / 12%)",
                                    color: "oklch(0.65 0.2 25)",
                                  }}
                                  title="Reject"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleAction(b.id, "delete")}
                              data-ocid={`bank_approval.delete_button.${i + 1}`}
                              className="p-1.5 rounded-lg text-red-700 hover:text-red-500"
                              style={{ background: "oklch(0.14 0 0)" }}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View modal */}
      {viewBank && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0 0 0 / 80%)" }}
          data-ocid="bank_approval.dialog"
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-3"
            style={{
              background: "oklch(0.1 0 0)",
              border: "1px solid oklch(0.75 0.15 85 / 30%)",
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-white">Bank Account Details</h3>
              <button
                type="button"
                onClick={() => setViewBank(null)}
                data-ocid="bank_approval.close_button"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {(
              [
                ["User Email", viewBank.userId],
                ["Bank Name", viewBank.bankName],
                ["Account Type", viewBank.accountType],
                ["Account Holder", viewBank.accountHolderName],
                ["Account Number", viewBank.accountNumber],
                ["IFSC Code", viewBank.ifscCode],
                ["Mobile", viewBank.mobileNumber],
                ["UPI ID", viewBank.upiId],
                ["IB ID", viewBank.internetBankingId],
                ["Fund Type", viewBank.fundType],
                ["Status", viewBank.status.toUpperCase()],
              ] as [string, string][]
            ).map(
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
                    <span className="text-xs text-white font-medium break-all max-w-[180px] text-right">
                      {v}
                    </span>
                  </div>
                ),
            )}

            {viewBank.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleAction(viewBank.id, "approve")}
                  data-ocid="bank_approval.modal.confirm_button"
                  className="flex-1 py-2 rounded-lg text-sm font-bold"
                  style={{
                    background: "oklch(0.6 0.2 145 / 20%)",
                    color: "oklch(0.72 0.2 145)",
                    border: "1px solid oklch(0.6 0.2 145 / 40%)",
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(viewBank.id, "reject")}
                  data-ocid="bank_approval.modal.cancel_button"
                  className="flex-1 py-2 rounded-lg text-sm font-bold"
                  style={{
                    background: "oklch(0.5 0.2 25 / 20%)",
                    color: "oklch(0.65 0.2 25)",
                    border: "1px solid oklch(0.5 0.2 25 / 40%)",
                  }}
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
