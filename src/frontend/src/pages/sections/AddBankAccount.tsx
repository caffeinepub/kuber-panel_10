import {
  Building2,
  CheckCircle,
  Clock,
  Edit2,
  Eye,
  Plus,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { BankAccountData } from "../../backend";
import { useApp } from "../../context/AppContext";
import { useActor } from "../../hooks/useActor";

const statusConfig = {
  pending: {
    label: "PENDING",
    icon: Clock,
    color: "oklch(0.8 0.18 85)",
    bg: "oklch(0.75 0.15 85 / 15%)",
  },
  approved: {
    label: "APPROVED",
    icon: CheckCircle,
    color: "oklch(0.7 0.2 145)",
    bg: "oklch(0.6 0.2 145 / 15%)",
  },
  rejected: {
    label: "REJECTED",
    icon: XCircle,
    color: "oklch(0.65 0.2 25)",
    bg: "oklch(0.6 0.2 25 / 15%)",
  },
};

const emptyForm = {
  accountType: "Saving",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  mobileNumber: "",
  internetBankingId: "",
  internetBankingPassword: "",
  upiId: "",
  qrCodeUrl: "",
  fundType: "gaming",
};

export default function AddBankAccount() {
  const { bankAccounts, refresh } = useApp();
  const { actor } = useActor();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [viewAccount, setViewAccount] = useState<BankAccountData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!actor) return;
    if (!form.bankName || !form.accountNumber || !form.ifscCode) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await actor.updateBankAccount(
          editId,
          form.accountType,
          form.bankName,
          form.accountHolderName,
          form.accountNumber,
          form.ifscCode,
          form.mobileNumber,
          form.internetBankingId,
          form.internetBankingPassword,
          form.upiId,
          form.qrCodeUrl,
          form.fundType,
        );
        toast.success("Bank account updated");
      } else {
        await actor.createBankAccount(
          form.accountType,
          form.bankName,
          form.accountHolderName,
          form.accountNumber,
          form.ifscCode,
          form.mobileNumber,
          form.internetBankingId,
          form.internetBankingPassword,
          form.upiId,
          form.qrCodeUrl,
          form.fundType,
        );
        toast.success("Bank account submitted for approval");
      }
      setShowForm(false);
      setForm({ ...emptyForm });
      setEditId(null);
      refresh();
    } catch (_e) {
      toast.error("Failed to save bank account");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (acc: BankAccountData) => {
    setForm({
      accountType: acc.accountType,
      bankName: acc.bankName,
      accountHolderName: acc.accountHolderName,
      accountNumber: acc.accountNumber,
      ifscCode: acc.ifscCode,
      mobileNumber: acc.mobileNumber,
      internetBankingId: acc.internetBankingId,
      internetBankingPassword: acc.internetBankingPassword,
      upiId: acc.upiId,
      qrCodeUrl: acc.qrCodeUrl,
      fundType: acc.fundType,
    });
    setEditId(acc.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!actor || !confirm("Delete this bank account?")) return;
    try {
      await actor.deleteBankAccount(id);
      toast.success("Bank account deleted");
      refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    type = "text",
    ocid = "",
  ) => (
    <div>
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
        {label}
      </div>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        data-ocid={ocid || `add_bank.${key}.input`}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
        style={{
          background: "oklch(0.13 0 0)",
          border: "1px solid oklch(0.75 0.15 85 / 20%)",
        }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold gold-text">Add Bank Account</h2>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm({ ...emptyForm });
          }}
          data-ocid="add_bank.open_modal_button"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-black gold-gradient"
        >
          <Plus className="w-4 h-4" />
          Add New Bank
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="dark-card rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">
              {editId ? "Edit Bank Account" : "New Bank Account"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
                Account Type
              </div>
              <select
                value={form.accountType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, accountType: e.target.value }))
                }
                data-ocid="add_bank.account_type.select"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                style={{
                  background: "oklch(0.13 0 0)",
                  border: "1px solid oklch(0.75 0.15 85 / 20%)",
                }}
              >
                <option>Saving</option>
                <option>Current</option>
                <option>Corporate</option>
              </select>
            </div>
            {field("Bank Name *", "bankName")}
            {field("Account Holder Name *", "accountHolderName")}
            {field("Account Number *", "accountNumber")}
            {field("IFSC Code *", "ifscCode")}
            {field("Mobile Number", "mobileNumber", "tel")}
            {field("Internet Banking ID", "internetBankingId")}
            {field(
              "Internet Banking Password",
              "internetBankingPassword",
              "password",
            )}
            {field("UPI ID", "upiId")}
            {field("QR Code URL (optional)", "qrCodeUrl")}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              data-ocid="add_bank.submit_button"
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-black gold-gradient disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editId
                  ? "Update Bank"
                  : "Submit for Approval"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              data-ocid="add_bank.cancel_button"
              className="px-6 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white"
              style={{ background: "oklch(0.13 0 0)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bank list */}
      <div className="space-y-3">
        {bankAccounts.length === 0 && (
          <div
            data-ocid="add_bank.empty_state"
            className="dark-card rounded-xl p-10 text-center"
          >
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-500">No bank accounts added yet</p>
          </div>
        )}
        {bankAccounts.map((acc, i) => {
          const cfg =
            statusConfig[acc.status as keyof typeof statusConfig] ||
            statusConfig.pending;
          const StatusIcon = cfg.icon;
          return (
            <div
              key={acc.id}
              data-ocid={`add_bank.item.${i + 1}`}
              className="dark-card rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "oklch(0.75 0.15 85 / 15%)" }}
                  >
                    <span className="text-lg font-bold gold-text">
                      {acc.bankName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {acc.bankName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {acc.accountHolderName} •{" "}
                      {acc.accountNumber
                        .slice(-4)
                        .padStart(acc.accountNumber.length, "*")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ color: cfg.color, background: cfg.bg }}
                  >
                    <StatusIcon className="w-3 h-3" /> {cfg.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewAccount(acc)}
                    data-ocid={`add_bank.view.button.${i + 1}`}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white"
                    style={{ background: "oklch(0.14 0 0)" }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {acc.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleEdit(acc)}
                      data-ocid={`add_bank.edit_button.${i + 1}`}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white"
                      style={{ background: "oklch(0.14 0 0)" }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(acc.id)}
                    data-ocid={`add_bank.delete_button.${i + 1}`}
                    className="p-1.5 rounded-lg text-red-600 hover:text-red-400"
                    style={{ background: "oklch(0.14 0 0)" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View modal */}
      {viewAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0 0 0 / 80%)" }}
          data-ocid="add_bank.dialog"
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-3"
            style={{
              background: "oklch(0.1 0 0)",
              border: "1px solid oklch(0.75 0.15 85 / 30%)",
            }}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white">Bank Account Details</h3>
              <button
                type="button"
                onClick={() => setViewAccount(null)}
                data-ocid="add_bank.close_button"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {Object.entries({
              "Bank Name": viewAccount.bankName,
              "Account Type": viewAccount.accountType,
              "Account Holder": viewAccount.accountHolderName,
              "Account Number": viewAccount.accountNumber,
              "IFSC Code": viewAccount.ifscCode,
              Mobile: viewAccount.mobileNumber,
              "UPI ID": viewAccount.upiId,
              "IB ID": viewAccount.internetBankingId,
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
                    <span className="text-xs text-white font-medium">{v}</span>
                  </div>
                ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
