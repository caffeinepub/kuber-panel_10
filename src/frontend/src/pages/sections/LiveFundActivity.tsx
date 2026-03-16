import { Activity, Power, PowerOff, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";
import { useActor } from "../../hooks/useActor";
import * as LocalStore from "../../utils/LocalStore";

interface LiveTx {
  id: string;
  date: string;
  time: string;
  utrNumber: string;
  credit: number;
  debit: number;
  bankId: string;
  fundType: string;
}

const generate12DigitUTR = () =>
  Math.floor(100000000000 + Math.random() * 900000000000).toString();

const randAmount = () => Math.floor(Math.random() * 49000 + 1000);

// Commission rate: 15% of transaction amount
const COMMISSION_RATE = 0.15;

export default function LiveFundActivity() {
  const {
    bankAccounts,
    activeFundSessions,
    setActiveFundSession,
    clearFundSession,
    isAdmin,
  } = useApp();
  const { actor } = useActor();
  const [liveTxns, setLiveTxns] = useState<LiveTx[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const approvedBanks = bankAccounts.filter((b) => b.status === "approved");
  const activeSessions = Object.entries(activeFundSessions);
  const activeCount = activeSessions.length;

  const runTick = useCallback(async () => {
    const sessions = Object.entries(activeFundSessions);
    if (!sessions.length) return;
    const sessionEntry = sessions[Math.floor(Math.random() * sessions.length)];
    if (!sessionEntry) return;
    const [bankId, { fundType }] = sessionEntry;
    const utr = generate12DigitUTR();
    const isCredit = Math.random() > 0.3;
    const amount = randAmount();
    const now = new Date();
    const newTx: LiveTx = {
      id: Math.random().toString(36),
      date: now.toLocaleDateString("en-IN"),
      time: now.toLocaleTimeString("en-IN"),
      utrNumber: utr,
      credit: isCredit ? amount : 0,
      debit: isCredit ? 0 : amount,
      bankId,
      fundType,
    };
    setLiveTxns((prev) => [newTx, ...prev].slice(0, 50));

    // Add commission to admin balance
    const commission = +(amount * COMMISSION_RATE).toFixed(2);
    LocalStore.addAdminCommission(commission);
    LocalStore.addAdminCommissionLog({
      bankId,
      bankName: approvedBanks.find((b) => b.id === bankId)?.bankName || "Bank",
      accountNumber:
        approvedBanks.find((b) => b.id === bankId)?.accountNumber || "",
      fundType,
      amount: commission,
      date: now.toISOString(),
    });

    if (actor) {
      try {
        await actor.createTransaction(
          bankId,
          utr,
          newTx.credit,
          newTx.debit,
          fundType,
        );
      } catch {}
    }
  }, [activeFundSessions, actor, approvedBanks]);

  useEffect(() => {
    if (!isAdmin || activeCount === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    // Run immediately once
    runTick();
    intervalRef.current = setInterval(runTick, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAdmin, activeCount, runTick]);

  const handleToggle = (bankId: string, currentFundType: string) => {
    if (activeFundSessions[bankId]) {
      clearFundSession(bankId);
      toast.success("Fund activity stopped");
    } else {
      const sessionId = `session_${Date.now()}`;
      setActiveFundSession(bankId, sessionId, currentFundType);
      toast.success(`${currentFundType.toUpperCase()} fund activity started`);
    }
  };

  const getBankName = (id: string) =>
    approvedBanks.find((b) => b.id === id)?.bankName || "Unknown";

  // Non-admin: show offline
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 gold-text" />
          <h2 className="text-xl font-bold gold-text">Live Fund Activity</h2>
        </div>
        <div
          className="dark-card rounded-2xl p-10 flex flex-col items-center justify-center gap-4 text-center"
          data-ocid="live_activity.offline_state"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "oklch(0.6 0.2 25 / 12%)",
              border: "1px solid oklch(0.6 0.2 25 / 25%)",
            }}
          >
            <WifiOff
              className="w-8 h-8"
              style={{ color: "oklch(0.65 0.2 25)" }}
            />
          </div>
          <div>
            <div className="font-bold text-white mb-1">
              Live Transactions Offline
            </div>
            <div className="text-xs text-gray-500">
              Live transaction feed is not available for your account.
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "oklch(0.6 0.2 25 / 12%)",
              color: "oklch(0.65 0.2 25)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "oklch(0.6 0.2 25)" }}
            />
            OFFLINE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 gold-text" />
          <h2 className="text-xl font-bold gold-text">Live Fund Activity</h2>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{
            background:
              activeCount > 0 ? "oklch(0.6 0.2 145 / 12%)" : "oklch(0.13 0 0)",
            border:
              activeCount > 0
                ? "1px solid oklch(0.6 0.2 145 / 30%)"
                : "1px solid oklch(0.2 0 0)",
          }}
        >
          {activeCount > 0 && <div className="live-dot" />}
          <span
            className="text-xs font-bold"
            style={{
              color: activeCount > 0 ? "oklch(0.7 0.2 145)" : "oklch(0.5 0 0)",
            }}
          >
            {activeCount > 0 ? `${activeCount} LIVE` : "ALL OFF"}
          </span>
        </div>
      </div>

      {/* Bank cards with toggle */}
      <div className="grid grid-cols-1 gap-3">
        {approvedBanks.length === 0 && (
          <div
            data-ocid="live_activity.empty_state"
            className="dark-card rounded-xl p-10 text-center"
          >
            <p className="text-gray-500">
              No approved bank accounts. Approve banks from Bank Approval
              section.
            </p>
          </div>
        )}
        {approvedBanks.map((bank, i) => {
          const isActive = !!activeFundSessions[bank.id];
          const fundType =
            activeFundSessions[bank.id]?.fundType || bank.fundType || "gaming";
          return (
            <div
              key={bank.id}
              data-ocid={`live_activity.item.${i + 1}`}
              className="dark-card rounded-xl p-4"
              style={{
                border: isActive
                  ? "1px solid oklch(0.6 0.2 145 / 30%)"
                  : "1px solid oklch(0.2 0 0)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">
                    {bank.bankName}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {bank.accountHolderName}
                  </div>
                  <div className="text-xs font-mono text-gray-600 mt-0.5">
                    Acc: {bank.accountNumber}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5 capitalize">
                    Fund: {fundType} | IFSC: {bank.ifscCode}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isActive && (
                    <div
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                      style={{ background: "oklch(0.6 0.2 145 / 12%)" }}
                    >
                      <div className="live-dot" />
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: "oklch(0.7 0.2 145)" }}
                      >
                        LIVE
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggle(bank.id, fundType)}
                    data-ocid={`live_activity.toggle.${i + 1}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: isActive
                        ? "oklch(0.5 0.2 25 / 15%)"
                        : "oklch(0.6 0.2 145 / 15%)",
                      border: isActive
                        ? "1px solid oklch(0.5 0.2 25 / 30%)"
                        : "1px solid oklch(0.6 0.2 145 / 30%)",
                      color: isActive
                        ? "oklch(0.7 0.2 25)"
                        : "oklch(0.7 0.2 145)",
                    }}
                  >
                    {isActive ? (
                      <PowerOff className="w-3.5 h-3.5" />
                    ) : (
                      <Power className="w-3.5 h-3.5" />
                    )}
                    {isActive ? "Turn OFF" : "Turn ON"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live transaction feed */}
      <div className="dark-card rounded-xl overflow-hidden">
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}
        >
          <div className="flex items-center gap-2">
            {activeCount > 0 && <div className="live-dot" />}
            <span className="text-sm font-bold gold-text">
              {activeCount > 0
                ? "LIVE TRANSACTION FEED"
                : "TRANSACTION HISTORY"}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {liveTxns.length} entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-ocid="live_activity.table">
            <thead>
              <tr
                style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}
              >
                {[
                  "Date",
                  "Time",
                  "Bank",
                  "UTR Number",
                  "Fund",
                  "Credit (₹)",
                  "Debit (₹)",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "oklch(0.75 0.15 85)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liveTxns.length === 0 ? (
                <tr data-ocid="live_activity.empty_state">
                  <td
                    colSpan={7}
                    className="text-center py-10 text-gray-600 text-sm"
                  >
                    {activeCount > 0
                      ? "Waiting for first transaction..."
                      : "Turn ON a bank account to start live activity"}
                  </td>
                </tr>
              ) : (
                liveTxns.map((tx, i) => (
                  <tr
                    key={tx.id}
                    data-ocid={`live_activity.tx.${i + 1}`}
                    className="table-row-hover"
                    style={{
                      borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)",
                    }}
                  >
                    <td className="px-3 py-2.5 text-xs text-gray-300">
                      {tx.date}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-400">
                      {tx.time}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-white">
                      {getBankName(tx.bankId)}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-mono text-gray-400">
                      {tx.utrNumber}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="text-xs font-bold uppercase capitalize"
                        style={{ color: "oklch(0.75 0.15 220)" }}
                      >
                        {tx.fundType}
                      </span>
                    </td>
                    <td
                      className="px-3 py-2.5 text-xs font-semibold"
                      style={{ color: "oklch(0.7 0.2 145)" }}
                    >
                      {tx.credit > 0
                        ? `+${tx.credit.toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td
                      className="px-3 py-2.5 text-xs font-semibold"
                      style={{ color: "oklch(0.65 0.2 25)" }}
                    >
                      {tx.debit > 0
                        ? `-${tx.debit.toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
