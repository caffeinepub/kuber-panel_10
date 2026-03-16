import { ArrowDownCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";
import { useActor } from "../../hooks/useActor";
import * as LocalStore from "../../utils/LocalStore";

type Method = "upi" | "bank" | "usdt";
type BankMode = "IMPS" | "NEFT" | "RTGS";

const bankModes: {
  key: BankMode;
  label: string;
  limit: string;
  desc: string;
}[] = [
  {
    key: "IMPS",
    label: "IMPS",
    limit: "Max ₹2,00,000/day",
    desc: "Instant Transfer",
  },
  {
    key: "NEFT",
    label: "NEFT",
    limit: "Max ₹10,00,000/day",
    desc: "2 Hours Settlement",
  },
  {
    key: "RTGS",
    label: "RTGS",
    limit: "Min ₹2L | Max ₹2Cr/day",
    desc: "Same Day Settlement",
  },
];

export default function WithdrawalSection() {
  const { isAdmin, refresh } = useApp();
  const { actor } = useActor();
  const [method, setMethod] = useState<Method>("upi");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [transferMode, setTransferMode] = useState<BankMode>("IMPS");
  const [usdtAddress, setUsdtAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const displayBalance = isAdmin ? LocalStore.getAdminCommission() : 0;

  const handleSubmit = async () => {
    const amt = Number.parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    const currentBalance = isAdmin ? LocalStore.getAdminCommission() : 0;
    if (amt > currentBalance) {
      toast.error(
        `Insufficient balance. Available: ₹${currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      );
      return;
    }

    let methodDetails = "";
    if (method === "upi") {
      if (!upiId) {
        toast.error("Enter UPI ID");
        return;
      }
      methodDetails = JSON.stringify({ upiId });
    } else if (method === "bank") {
      if (!bankName || !accountNumber || !ifsc) {
        toast.error("Fill all bank details");
        return;
      }
      methodDetails = JSON.stringify({
        bankName,
        accountNumber,
        accountHolderName,
        ifsc,
        transferMode,
      });
    } else {
      if (!usdtAddress) {
        toast.error("Enter USDT address");
        return;
      }
      methodDetails = JSON.stringify({ usdtAddress });
    }

    setLoading(true);
    try {
      if (actor) {
        await actor.createWithdrawal(amt, method, methodDetails);
      }
      if (isAdmin) {
        LocalStore.deductAdminCommission(amt);
      }
      // Save to localStorage for persistence
      const newWithdrawal = {
        id: `wd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        amount: amt,
        method,
        methodDetails,
        status: "approved",
        createdAt: Date.now(),
        utrNumber: `${Date.now().toString().slice(0, 12)}`,
      };
      const existing = JSON.parse(
        localStorage.getItem("kuber_withdrawal_history") ?? "[]",
      );
      existing.unshift(newWithdrawal);
      localStorage.setItem(
        "kuber_withdrawal_history",
        JSON.stringify(existing.slice(0, 200)),
      );
      toast.success("Withdrawal request submitted successfully!");
      setAmount("");
      refresh();
    } catch {
      toast.error("Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none";
  const inputStyle = {
    background: "oklch(0.13 0 0)",
    border: "1px solid oklch(0.75 0.15 85 / 20%)",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gold-text">Withdrawal</h2>

      <div className="dark-card rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Available Commission Balance
          </div>
          <div className="text-3xl font-black gold-text">
            ₹
            {displayBalance.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "oklch(0.75 0.15 85 / 12%)" }}
        >
          <ArrowDownCircle className="w-7 h-7 gold-text" />
        </div>
      </div>

      <div className="dark-card rounded-xl overflow-hidden">
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}
        >
          <div className="text-sm font-bold gold-text">
            Select Withdrawal Method
          </div>
        </div>
        <div className="p-4 space-y-5">
          <div className="flex gap-2">
            {(["upi", "bank", "usdt"] as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                data-ocid={`withdrawal.${m}.tab`}
                className="flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all"
                style={
                  method === m
                    ? {
                        background:
                          "linear-gradient(135deg, oklch(0.82 0.17 85), oklch(0.67 0.13 85))",
                        color: "black",
                      }
                    : { background: "oklch(0.12 0 0)", color: "oklch(0.5 0 0)" }
                }
              >
                {m === "upi" ? "UPI" : m === "bank" ? "Bank Transfer" : "USDT"}
              </button>
            ))}
          </div>

          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Withdrawal Amount (₹)
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              data-ocid="withdrawal.amount.input"
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {method === "upi" && (
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                UPI ID
              </div>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                data-ocid="withdrawal.upi_id.input"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          )}

          {method === "bank" && (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Transfer Mode
                </div>
                <div className="space-y-2">
                  {bankModes.map(({ key, label, limit, desc }) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background:
                          transferMode === key
                            ? "oklch(0.75 0.15 85 / 12%)"
                            : "oklch(0.1 0 0)",
                        border:
                          transferMode === key
                            ? "1px solid oklch(0.75 0.15 85 / 40%)"
                            : "1px solid oklch(0.2 0 0)",
                      }}
                    >
                      <input
                        type="radio"
                        name="transferMode"
                        value={key}
                        checked={transferMode === key}
                        onChange={() => setTransferMode(key)}
                        className="accent-yellow-400"
                        data-ocid={`withdrawal.${key.toLowerCase()}.radio`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">
                            {label}
                          </span>
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: "oklch(0.75 0.15 85)" }}
                          >
                            {limit}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Account Holder Name
                </div>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Account holder name"
                  data-ocid="withdrawal.holder.input"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Bank Name
                </div>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank name"
                  data-ocid="withdrawal.bank_name.input"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  Account Number
                </div>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account number"
                  data-ocid="withdrawal.account_number.input"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                  IFSC Code
                </div>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="IFSC code"
                  data-ocid="withdrawal.ifsc.input"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {method === "usdt" && (
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">
                USDT Wallet Address
              </div>
              <input
                type="text"
                value={usdtAddress}
                onChange={(e) => setUsdtAddress(e.target.value)}
                placeholder="Enter USDT TRC20 address"
                data-ocid="withdrawal.usdt.input"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            data-ocid="withdrawal.submit_button"
            className="w-full py-3 rounded-xl text-sm font-bold text-black gold-gradient disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : "Submit Withdrawal Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
