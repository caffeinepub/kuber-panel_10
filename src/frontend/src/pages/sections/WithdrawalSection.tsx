import { ArrowDownCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";
import { useActor } from "../../hooks/useActor";

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
  const { commissionBalance, refresh } = useApp();
  const { actor } = useActor();
  const [method, setMethod] = useState<Method>("upi");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [transferMode, setTransferMode] = useState<BankMode>("IMPS");
  const [usdtAddress, setUsdtAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingTimer, setPendingTimer] = useState<number | null>(null);

  useEffect(() => {
    if (pendingTimer !== null && pendingTimer > 0) {
      const t = setTimeout(
        () => setPendingTimer((prev) => (prev ?? 1) - 1),
        1000,
      );
      return () => clearTimeout(t);
    }
    if (pendingTimer === 0) {
      toast.success("Withdrawal approved automatically!");
      setPendingTimer(null);
      refresh();
    }
  }, [pendingTimer, refresh]);

  const handleSubmit = async () => {
    if (!actor) return;
    const amt = Number.parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter valid amount");
      return;
    }
    if (amt > commissionBalance) {
      toast.error("Insufficient commission balance");
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
      await actor.createWithdrawal(amt, method, methodDetails);
      toast.success(
        "Withdrawal request submitted. Auto-approving in 10 minutes.",
      );
      setPendingTimer(600);
      setAmount("");
      refresh();
    } catch {
      toast.error("Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none";
  const inputStyle = {
    background: "oklch(0.13 0 0)",
    border: "1px solid oklch(0.75 0.15 85 / 20%)",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gold-text">Withdrawal</h2>

      <div className="dark-card rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Available Balance</div>
          <div className="text-2xl font-black gold-text">
            ₹{commissionBalance.toLocaleString("en-IN")}
          </div>
        </div>
        {pendingTimer !== null && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "oklch(0.75 0.15 85 / 15%)" }}
          >
            <Clock className="w-4 h-4 gold-text" />
            <div>
              <div className="text-xs text-gray-400">Auto-approve in</div>
              <div className="font-bold gold-text">
                {formatTimer(pendingTimer)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="flex rounded-lg p-1"
        style={{ background: "oklch(0.08 0 0)" }}
      >
        {(["upi", "bank", "usdt"] as Method[]).map((m) => (
          <button
            type="button"
            key={m}
            onClick={() => setMethod(m)}
            data-ocid={`withdrawal.${m}_tab`}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              method === m
                ? "gold-gradient text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {m === "upi" ? "UPI" : m === "bank" ? "Bank Transfer" : "USDT"}
          </button>
        ))}
      </div>

      <div className="dark-card rounded-xl p-5 space-y-4">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
            Amount (₹)
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter withdrawal amount"
            data-ocid="withdrawal.amount.input"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {method === "upi" && (
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
              UPI ID
            </div>
            <input
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
          <div className="space-y-4">
            {/* IMPS/NEFT/RTGS selector */}
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                Transfer Mode
              </div>
              <div className="grid grid-cols-3 gap-2">
                {bankModes.map(({ key, label, limit, desc }) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setTransferMode(key)}
                    data-ocid={`withdrawal.${key.toLowerCase()}_mode.toggle`}
                    className="flex flex-col p-3 rounded-xl text-left transition-all"
                    style={{
                      background:
                        transferMode === key
                          ? "linear-gradient(135deg, oklch(0.65 0.2 220 / 25%), oklch(0.75 0.17 85 / 20%))"
                          : "oklch(0.1 0 0)",
                      border:
                        transferMode === key
                          ? "1.5px solid oklch(0.75 0.17 85 / 50%)"
                          : "1.5px solid oklch(0.75 0.15 85 / 10%)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor:
                            transferMode === key
                              ? "oklch(0.82 0.17 85)"
                              : "oklch(0.4 0 0)",
                        }}
                      >
                        {transferMode === key && (
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "oklch(0.82 0.17 85)" }}
                          />
                        )}
                      </div>
                      <span
                        className="text-sm font-black"
                        style={{
                          color:
                            transferMode === key
                              ? "oklch(0.88 0.16 85)"
                              : "oklch(0.7 0 0)",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <div
                      className="text-[10px] font-semibold"
                      style={{ color: "oklch(0.65 0.2 220)" }}
                    >
                      {desc}
                    </div>
                    <div
                      className="text-[9px] mt-0.5"
                      style={{ color: "oklch(0.55 0 0)" }}
                    >
                      {limit}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-400 mb-1 block">
                  Bank Name
                </div>
                <input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Bank name"
                  data-ocid="withdrawal.bank_name.input"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1 block">
                  Account Number
                </div>
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account number"
                  data-ocid="withdrawal.account_number.input"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div className="col-span-2">
                <div className="text-xs text-gray-400 mb-1 block">
                  IFSC Code
                </div>
                <input
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  placeholder="IFSC Code"
                  data-ocid="withdrawal.ifsc.input"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {method === "usdt" && (
          <div className="space-y-3">
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{
                background: "oklch(0.6 0.15 180 / 10%)",
                border: "1px solid oklch(0.6 0.15 180 / 20%)",
              }}
            >
              <span
                className="text-lg font-black"
                style={{ color: "oklch(0.6 0.15 180)" }}
              >
                USDT
              </span>
              <span className="text-xs text-gray-400">
                Tether - TRC20 / ERC20
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1 block">
                USDT Wallet Address
              </div>
              <input
                value={usdtAddress}
                onChange={(e) => setUsdtAddress(e.target.value)}
                placeholder="Enter USDT wallet address"
                data-ocid="withdrawal.usdt_address.input"
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          data-ocid="withdrawal.submit_button"
          className="w-full py-3 rounded-lg text-sm font-bold text-black gold-gradient disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowDownCircle className="w-4 h-4" />
          {loading ? "Processing..." : "Submit Withdrawal Request"}
        </button>

        <p className="text-center text-xs text-gray-600">
          <Clock className="w-3 h-3 inline mr-1" />
          Auto-approved after 10 minutes • Amount deducted from commission
          balance
        </p>
      </div>
    </div>
  );
}
