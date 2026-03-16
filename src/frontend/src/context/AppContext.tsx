import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  FundSessionData,
  TransactionData,
  WithdrawalData,
} from "../backend";
import { useActor } from "../hooks/useActor";
import * as LocalStore from "../utils/LocalStore";
import type {
  BankAccountLS,
  BankStatementEntry,
  LiveTxEntry,
  UserActivation,
} from "../utils/LocalStore";

const ADMIN_EMAIL = "kuberpanelwork@gmail.com";

export const COMMISSION_RATES: Record<string, number> = {
  gaming: 0.15,
  stock: 0.3,
  mix: 0.3,
  political: 0.25,
  all: 0.2,
};

const generate12DigitUTR = () =>
  Math.floor(100000000000 + Math.random() * 900000000000).toString();

const randAmount = () => Math.floor(Math.random() * 49000 + 1000);

type Section =
  | "dashboard"
  | "add-bank"
  | "bank-statement"
  | "gaming-fund"
  | "stock-fund"
  | "mix-fund"
  | "political-fund"
  | "live-activity"
  | "commission"
  | "withdrawal"
  | "withdrawal-history"
  | "activation"
  | "help-support"
  | "generated-code"
  | "user-management"
  | "bank-approval"
  | "change-support";

export interface LiveTx {
  id: string;
  date: string;
  time: string;
  utrNumber: string;
  credit: number;
  debit: number;
  bankId: string;
  fundType: string;
  timestamp: string;
}

interface AppContextType {
  isAdmin: boolean;
  isActivated: boolean;
  userActivation: UserActivation | null;
  activatedFunds: string[];
  isFundActive: (fund: string) => boolean;
  isLoading: boolean;
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  bankAccountsLS: BankAccountLS[];
  bankAccounts: BankAccountLS[];
  transactions: TransactionData[];
  withdrawals: WithdrawalData[];
  adminCommissionBalance: number;
  commissionBalance: number;
  fundSessions: FundSessionData[];
  supportLink: string;
  activeFundSessions: Record<string, { sessionId: string; fundType: string }>;
  liveTxns: LiveTx[];
  refresh: () => void;
  setActiveFundSession: (
    bankId: string,
    sessionId: string,
    fundType: string,
  ) => void;
  clearFundSession: (bankId: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({
  children,
  onLogout,
}: {
  children: ReactNode;
  onLogout: () => void;
}) {
  const { actor } = useActor();

  const storedEmail = localStorage.getItem("kuber_user_email") ?? "";
  const isAdmin = storedEmail.toLowerCase() === ADMIN_EMAIL;

  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [bankAccountsLS, setBankAccountsLS] = useState<BankAccountLS[]>(() =>
    LocalStore.getUserBankAccounts(storedEmail),
  );
  const [userActivation, setUserActivationState] =
    useState<UserActivation | null>(() =>
      LocalStore.getUserActivation(storedEmail),
    );
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [adminCommissionBalance, setAdminCommissionBalance] = useState(() =>
    LocalStore.getAdminCommission(),
  );
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [fundSessions, setFundSessions] = useState<FundSessionData[]>([]);
  const [supportLink, setSupportLink] = useState(
    "https://t.me/+fUsY5uHRNeYyYmJl",
  );
  const [activeFundSessions, setActiveFundSessionsState] = useState<
    Record<string, { sessionId: string; fundType: string }>
  >(() => LocalStore.getSavedLiveSessions());

  // Live transactions - persist in app state so they survive section changes
  const [liveTxns, setLiveTxns] = useState<LiveTx[]>(() =>
    LocalStore.getAllStoredLiveTxns().map((t) => ({
      ...t,
      timestamp: t.timestamp ?? new Date().toISOString(),
    })),
  );

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const txTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs so callbacks always see fresh data without stale closures
  const activeFundSessionsRef = useRef(activeFundSessions);
  activeFundSessionsRef.current = activeFundSessions;

  const bankAccountsRef = useRef(bankAccountsLS);
  bankAccountsRef.current = bankAccountsLS;

  // Derived key to detect when sessions change
  const activeSessionKey = Object.keys(activeFundSessions).sort().join(",");

  const runTick = useCallback(async () => {
    const sessions = Object.entries(activeFundSessionsRef.current);
    if (!sessions.length || !isAdmin) return;

    const [bankId, { fundType }] =
      sessions[Math.floor(Math.random() * sessions.length)];
    const utr = generate12DigitUTR();
    const isCredit = Math.random() > 0.3;
    const amount = randAmount();
    const commRate = COMMISSION_RATES[fundType] ?? 0.15;
    const commission = +(amount * commRate).toFixed(2);
    const now = new Date();

    const newTx: LiveTx = {
      id: Math.random().toString(36).slice(2),
      date: now.toLocaleDateString("en-IN"),
      time: now.toLocaleTimeString("en-IN"),
      utrNumber: utr,
      credit: isCredit ? amount : 0,
      debit: isCredit ? 0 : amount,
      bankId,
      fundType,
      timestamp: now.toISOString(),
    };

    setLiveTxns((prev) => [newTx, ...prev]);

    LocalStore.addAdminCommission(commission);
    LocalStore.addToSessionCommission(bankId, commission);
    LocalStore.saveLiveTransaction(bankId, newTx as LiveTxEntry);

    setAdminCommissionBalance(LocalStore.getAdminCommission());

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
  }, [isAdmin, actor]);

  // Global transaction timer - persists across section navigation
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeSessionKey tracks activeFundSessions changes
  useEffect(() => {
    const hasSessions = activeSessionKey.length > 0;
    if (!isAdmin || !hasSessions) {
      if (txTimerRef.current) {
        clearTimeout(txTimerRef.current);
        txTimerRef.current = null;
      }
      return;
    }

    // Fire first tick immediately when sessions start
    runTick();

    const scheduleNext = () => {
      // 12-25 seconds - slightly faster
      const delay = 12000 + Math.random() * 13000;
      txTimerRef.current = setTimeout(() => {
        runTick();
        scheduleNext();
      }, delay);
    };
    scheduleNext();

    return () => {
      if (txTimerRef.current) {
        clearTimeout(txTimerRef.current);
        txTimerRef.current = null;
      }
    };
  }, [isAdmin, activeSessionKey, runTick]);

  const derived_activatedFunds = isAdmin
    ? ["gaming", "stock", "mix", "political", "all"]
    : userActivation?.isActive
      ? userActivation.activatedFunds
      : [];

  const isActivated =
    isAdmin ||
    (userActivation?.isActive === true && derived_activatedFunds.length > 0);

  const isFundActive = (fund: string): boolean => {
    if (isAdmin) return true;
    return (
      derived_activatedFunds.includes(fund) ||
      derived_activatedFunds.includes("all")
    );
  };

  const commissionBalance = isAdmin ? adminCommissionBalance : 0;

  const setActiveFundSession = useCallback(
    (bankId: string, sessionId: string, fundType: string) => {
      LocalStore.saveLiveSession(bankId, sessionId, fundType);
      LocalStore.setSessionStartTime(bankId, new Date().toISOString());
      setActiveFundSessionsState((prev) => ({
        ...prev,
        [bankId]: { sessionId, fundType },
      }));
    },
    [],
  );

  const clearFundSession = useCallback((bankId: string) => {
    const session = activeFundSessionsRef.current[bankId];
    if (session) {
      const sessionCommission = LocalStore.getAndClearSessionCommission(bankId);
      const bank = bankAccountsRef.current.find((b) => b.id === bankId);
      if (bank && sessionCommission > 0) {
        const fundLabel =
          session.fundType.charAt(0).toUpperCase() + session.fundType.slice(1);
        LocalStore.addCommissionHistoryEntry({
          fundType: session.fundType,
          fundLabel,
          bankName: bank.bankName,
          accountNumber: bank.accountNumber,
          totalCommission: sessionCommission,
          startTime:
            LocalStore.getSessionStartTime(bankId) ?? new Date().toISOString(),
          endTime: new Date().toISOString(),
        });
      }

      // Save live transactions to bank statement history BEFORE clearing
      const liveTxnsForBank = LocalStore.getLiveTransactionsByBank(bankId);
      if (liveTxnsForBank.length > 0 && bank) {
        const stmtEntries: BankStatementEntry[] = liveTxnsForBank.map((tx) => ({
          id: tx.id,
          bankId,
          bankName: bank.bankName,
          accountHolderName: bank.accountHolderName,
          accountNumber: bank.accountNumber,
          ifscCode: bank.ifscCode,
          mobileNumber: bank.mobileNumber,
          upiId: bank.upiId,
          fundType: tx.fundType,
          utrNumber: tx.utrNumber,
          credit: tx.credit,
          debit: tx.debit,
          date: tx.date,
          time: tx.time,
          timestamp: tx.timestamp,
        }));
        LocalStore.addBankStatementEntries(stmtEntries);
      }

      LocalStore.clearSessionStartTime(bankId);
      LocalStore.clearLiveTransactionsByBank(bankId);
    }

    // Also remove those txns from live state
    setLiveTxns((prev) => prev.filter((tx) => tx.bankId !== bankId));

    LocalStore.removeLiveSession(bankId);
    setActiveFundSessionsState((prev) => {
      const n = { ...prev };
      delete n[bankId];
      return n;
    });
    setAdminCommissionBalance(LocalStore.getAdminCommission());
  }, []);

  const refresh = useCallback(() => {
    const email = localStorage.getItem("kuber_user_email") ?? "";
    setBankAccountsLS(LocalStore.getUserBankAccounts(email));
    const act = LocalStore.getUserActivation(email);
    setUserActivationState(act);
    setAdminCommissionBalance(LocalStore.getAdminCommission());
    if (actor) {
      Promise.all([
        actor.getTransactions().catch(() => []),
        actor.getWithdrawals().catch(() => []),
        actor.getFundSessions().catch(() => []),
        actor.getSupportLink().catch(() => "https://t.me/+fUsY5uHRNeYyYmJl"),
      ])
        .then(([txns, wds, sessions, link]) => {
          setTransactions(txns);
          setWithdrawals(wds as any);
          setFundSessions(sessions as any);
          setSupportLink(link as string);
        })
        .catch(console.error);
    }
    setIsLoading(false);
  }, [actor]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (isAdmin) return;
    pollRef.current = setInterval(() => {
      const email = localStorage.getItem("kuber_user_email") ?? "";
      const act = LocalStore.getUserActivation(email);
      setUserActivationState(act);
      const users = LocalStore.getRegisteredUsers();
      if (!users.find((u) => u.email === email)) {
        onLogout();
      }
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAdmin, onLogout]);

  const logout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  return (
    <AppContext.Provider
      value={{
        isAdmin,
        isActivated,
        userActivation,
        activatedFunds: derived_activatedFunds,
        isFundActive,
        isLoading,
        activeSection,
        setActiveSection,
        bankAccountsLS,
        bankAccounts: bankAccountsLS,
        transactions,
        withdrawals,
        adminCommissionBalance,
        commissionBalance,
        fundSessions,
        supportLink,
        activeFundSessions,
        liveTxns,
        refresh,
        setActiveFundSession,
        clearFundSession,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};
