import {
  Building2,
  CheckCircle,
  Clock,
  Edit2,
  Eye,
  KeyRound,
  Plus,
  QrCode,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";
import * as LocalStore from "../../utils/LocalStore";
import type { BankAccountLS } from "../../utils/LocalStore";

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
  const { isActivated, isAdmin, setActiveSection } = useApp();
  const email = localStorage.getItem("kuber_user_email") ?? "";
  const [_refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [viewAccount, setViewAccount] = useState<BankAccountLS | null>(null);
  const [loading, setLoading] = useState(false);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  if (!isAdmin && !isActivated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "oklch(0.75 0.15 85 / 12%)",
            border: "2px solid oklch(0.75 0.15 85 / 30%)",
          }}
        >
          <KeyRound className="w-10 h-10 gold-text" />
        </div>
        <div>
          <div className="text-xl font-black text-white mb-2">
            Activation Required
          </div>
          <div className="text-sm text-gray-400">
            You need to activate your panel before adding a bank account.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveSection("activation" as any)}
          data-ocid="add_bank.activate_button"
          className="px-6 py-3 rounded-xl text-sm font-bold text-black gold-gradient"
        >
          Activate Panel Now
        </button>
      </div>
    );
  }

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((p) => ({ ...p, qrCodeUrl: dataUrl }));
      toast.success("QR code uploaded");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.bankName || !form.accountNumber || !form.ifscCode) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      try {
        if (editId) {
          LocalStore.updateBankAccount(editId, form);
          toast.success("Bank account updated");
        } else {
          LocalStore.createBankAccount({ ...form, userId: email });
          toast.success("Bank account submitted for approval");
        }
        setShowForm(false);
        setForm({ ...emptyForm });
        setEditId(null);
        triggerRefresh();
      } catch {
        toast.error("Failed to save bank account");
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleEdit = (acc: BankAccountLS) => {
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
    setViewAccount(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this bank account?")) return;
    LocalStore.deleteBankAccount(id);
    toast.success("Bank account deleted");
    setViewAccount(null);
    triggerRefresh();
  };

  const field = (label: string, key: keyof typeof emptyForm, type = "text") => (
    <div>
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
        {label}
      </div>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        data-ocid={`add_bank.${key}.input`}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
        style={{
          background: "oklch(0.13 0 0)",
          border: "1px solid oklch(0.75 0.15 85 / 20%)",
        }}
      />
    </div>
  );

  const accounts = LocalStore.getUserBankAccounts(email);

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
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black gold-gradient"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "Add New"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div
          className="dark-card rounded-xl p-5 space-y-4"
          data-ocid="add_bank.form.panel"
        >
          <h3 className="text-sm font-bold gold-text">
            {editId ? "Edit Bank Account" : "New Bank Account"}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {/* Account Type */}
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Account Type
              </div>
              <select
                value={form.accountType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, accountType: e.target.value }))
                }
                data-ocid="add_bank.accountType.select"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                style={{
                  background: "oklch(0.13 0 0)",
                  border: "1px solid oklch(0.75 0.15 85 / 20%)",
                }}
              >
                <option value="Saving">Saving Account</option>
                <option value="Current">Current Account</option>
                <option value="Corporate">Corporate Account</option>
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

            {/* QR Code Upload */}
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                QR Code (Optional)
              </div>
              <input
                ref={qrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                data-ocid="add_bank.qr_upload_button"
                onChange={handleQrUpload}
              />
              <button
                type="button"
                onClick={() => qrInputRef.current?.click()}
                data-ocid="add_bank.qr_select_button"
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: form.qrCodeUrl
                    ? "oklch(0.15 0.04 145)"
                    : "oklch(0.13 0 0)",
                  border: form.qrCodeUrl
                    ? "1px solid oklch(0.6 0.2 145 / 40%)"
                    : "1px dashed oklch(0.75 0.15 85 / 30%)",
                  color: form.qrCodeUrl
                    ? "oklch(0.75 0.2 145)"
                    : "oklch(0.65 0.1 85)",
                }}
              >
                <QrCode className="w-4 h-4" />
                {form.qrCodeUrl
                  ? "QR Code Uploaded ✓"
                  : "Upload QR Code from Gallery"}
              </button>
              {form.qrCodeUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={form.qrCodeUrl}
                    alt="QR Code"
                    className="w-16 h-16 rounded-lg object-contain"
                    style={{ background: "#fff", padding: 4 }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, qrCodeUrl: "" }))}
                    className="text-xs text-red-400 underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            data-ocid="add_bank.submit_button"
            className="w-full py-3 rounded-xl text-sm font-bold text-black gold-gradient disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editId
                ? "Update Account"
                : "Submit for Approval"}
          </button>
        </div>
      )}

      {/* Accounts list */}
      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div
            data-ocid="add_bank.empty_state"
            className="dark-card rounded-xl p-10 text-center"
          >
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-600 text-sm">No bank accounts added yet</p>
          </div>
        ) : (
          accounts.map((acc, i) => {
            const sc = statusConfig[acc.status];
            const StatusIcon = sc.icon;
            return (
              <div
                key={acc.id}
                data-ocid={`add_bank.item.${i + 1}`}
                className="dark-card rounded-xl p-4"
                style={{ border: `1px solid ${sc.color}33` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => setViewAccount(acc)}
                    data-ocid={`add_bank.view_button.${i + 1}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-sm text-white">
                        {acc.bankName}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        <StatusIcon className="w-2.5 h-2.5" />
                        {sc.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {acc.accountHolderName}
                    </div>
                    <div className="text-xs font-mono text-gray-600 mt-0.5">
                      Acc: {acc.accountNumber} | IFSC: {acc.ifscCode}
                    </div>
                    {acc.accountType && (
                      <div className="text-[10px] text-gray-600 mt-0.5">
                        {acc.accountType} Account
                      </div>
                    )}
                  </button>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {acc.qrCodeUrl && (
                      <div
                        className="p-1.5 rounded-lg"
                        title="QR Code available"
                        style={{
                          background: "oklch(0.6 0.2 145 / 12%)",
                          color: "oklch(0.75 0.2 145)",
                        }}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setViewAccount(acc)}
                      data-ocid={`add_bank.eye_button.${i + 1}`}
                      className="p-1.5 rounded-lg"
                      style={{
                        background: "oklch(0.65 0.2 220 / 12%)",
                        color: "oklch(0.75 0.18 220)",
                      }}
                      title="View details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {acc.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleEdit(acc)}
                        data-ocid={`add_bank.edit_button.${i + 1}`}
                        className="p-1.5 rounded-lg"
                        style={{
                          background: "oklch(0.75 0.15 85 / 12%)",
                          color: "oklch(0.8 0.18 85)",
                        }}
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(acc.id)}
                      data-ocid={`add_bank.delete_button.${i + 1}`}
                      className="p-1.5 rounded-lg"
                      style={{
                        background: "oklch(0.4 0.15 25 / 15%)",
                        color: "oklch(0.6 0.2 25)",
                      }}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Details Modal */}
      {viewAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "oklch(0 0 0 / 85%)" }}
          data-ocid="add_bank.dialog"
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.09 0.008 220)",
              border: "1px solid oklch(0.65 0.2 220 / 35%)",
            }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                background: "oklch(0.12 0.02 220)",
                borderBottom: "1px solid oklch(0.65 0.2 220 / 20%)",
              }}
            >
              <div>
                <div className="font-black text-sm gold-text tracking-wider">
                  Bank Account Details
                </div>
                <div className="text-[10px] text-gray-500">
                  {viewAccount.bankName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewAccount(null)}
                data-ocid="add_bank.close_button"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div
              className="px-5 py-4 space-y-0 overflow-y-auto"
              style={{ maxHeight: "70vh" }}
            >
              {[
                ["Account Type", viewAccount.accountType],
                ["Bank Name", viewAccount.bankName],
                ["Account Holder", viewAccount.accountHolderName],
                ["Account Number", viewAccount.accountNumber],
                ["IFSC Code", viewAccount.ifscCode],
                ["Mobile Number", viewAccount.mobileNumber],
                ["Internet Banking ID", viewAccount.internetBankingId],
                ["UPI ID", viewAccount.upiId],
                ["Status", viewAccount.status.toUpperCase()],
                [
                  "Added On",
                  new Date(viewAccount.createdAt).toLocaleString("en-IN"),
                ],
              ].map(([k, v]) =>
                v ? (
                  <div
                    key={k}
                    className="flex justify-between items-start py-2.5 gap-3"
                    style={{
                      borderBottom: "1px solid oklch(0.65 0.2 220 / 8%)",
                    }}
                  >
                    <span className="text-[11px] text-gray-500 flex-shrink-0">
                      {k}
                    </span>
                    <span className="text-[11px] font-semibold text-white text-right break-all">
                      {v}
                    </span>
                  </div>
                ) : null,
              )}
              {/* QR Code preview in modal */}
              {viewAccount.qrCodeUrl && (
                <div className="pt-3">
                  <div className="text-[11px] text-gray-500 mb-2">QR Code</div>
                  <div className="flex justify-center">
                    <img
                      src={viewAccount.qrCodeUrl}
                      alt="QR Code"
                      className="w-32 h-32 rounded-xl object-contain"
                      style={{ background: "#fff", padding: 8 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
