import { Activity, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useActor } from "../../hooks/useActor";

interface LiveTx {
  id: string;
  date: string;
  time: string;
  utrNumber: string;
  credit: number;
  debit: number;
  bankId: string;
}

const generateUTR = () =>
  `UTR${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
const randAmount = () => Math.floor(Math.random() * 49000 + 1000);

export default function LiveFundActivity() {
  const { bankAccounts, activeFundSessions, isAdmin } = useApp();
  const { actor } = useActor();
  const [liveTxns, setLiveTxns] = useState<LiveTx[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const approvedBanks = bankAccounts.filter((b) => b.status === "approved");
  const activeSessions = Object.entries(activeFundSessions);
  const activeCount = activeSessions.length;

  const runTick = useCallback(async () => {
    const sessions = Object.entries(activeFundSessions);
    const sessionEntry = sessions[Math.floor(Math.random() * sessions.length)];
    if (!sessionEntry) return;
    const [bankId, { fundType }] = sessionEntry;

    const utr = generateUTR();
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
    };

    setLiveTxns((prev) => [newTx, ...prev].slice(0, 50));

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
  }, [activeFundSessions, actor]);

  useEffect(() => {
    if (!isAdmin || activeCount === 0) return;
    intervalRef.current = setInterval(runTick, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAdmin, activeCount, runTick]);

  const getBankName = (id: string) =>
    approvedBanks.find((b) => b.id === id)?.bankName || "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="w-6 h-6 gold-text" />
        <h2 className="text-xl font-bold gold-text">Live Fund Activity</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvedBanks.length === 0 && (
          <div
            data-ocid="live_activity.empty_state"
            className="col-span-2 dark-card rounded-xl p-10 text-center"
          >
            <p className="text-gray-500">No approved bank accounts</p>
          </div>
        )}
        {approvedBanks.map((bank, i) => {
          const isActive = !!activeFundSessions[bank.id];
          const fundType = activeFundSessions[bank.id]?.fundType;
          return (
            <div
              key={bank.id}
              data-ocid={`live_activity.item.${i + 1}`}
              className="dark-card rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-white text-sm">
                    {bank.bankName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {bank.accountHolderName} • {bank.accountNumber}
                  </div>
                </div>
                {isActive && isAdmin ? (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: "oklch(0.6 0.2 145 / 15%)",
                      color: "oklch(0.7 0.2 145)",
                    }}
                  >
                    <div className="live-dot" />
                    LIVE - {fundType?.toUpperCase()}
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "oklch(0.13 0 0)",
                      color: "oklch(0.5 0 0)",
                    }}
                  >
                    <WifiOff className="w-3 h-3" />
                    OFFLINE
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <div className="dark-card rounded-xl overflow-hidden">
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}
          >
            {activeCount > 0 && <div className="live-dot" />}
            <span className="text-sm font-bold gold-text">
              {activeCount > 0
                ? "LIVE TRANSACTION FEED"
                : "TRANSACTION HISTORY"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" data-ocid="live_activity.table">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)",
                  }}
                >
                  {[
                    "Date",
                    "Time",
                    "Bank",
                    "UTR Number",
                    "Credit (₹)",
                    "Debit (₹)",
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
                {liveTxns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-600">
                      No live transactions yet
                    </td>
                  </tr>
                ) : (
                  liveTxns.map((t, i) => (
                    <tr
                      key={t.id}
                      data-ocid={`live_activity.item.${i + 1}`}
                      className="table-row-hover"
                      style={{
                        borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)",
                      }}
                    >
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {t.date}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {t.time}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300">
                        {getBankName(t.bankId)}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">
                        {t.utrNumber}
                      </td>
                      <td
                        className="px-4 py-3 text-xs font-bold"
                        style={{ color: "oklch(0.7 0.2 145)" }}
                      >
                        {t.credit > 0
                          ? `+${t.credit.toLocaleString("en-IN")}`
                          : "-"}
                      </td>
                      <td
                        className="px-4 py-3 text-xs font-bold"
                        style={{ color: "oklch(0.65 0.2 25)" }}
                      >
                        {t.debit > 0
                          ? `-${t.debit.toLocaleString("en-IN")}`
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
