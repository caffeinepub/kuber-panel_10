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
import type { BankAccountLS, UserActivation } from "../utils/LocalStore";

const ADMIN_EMAIL = "kuberpanelwork@gmail.com";

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

interface AppContextType {
  isAdmin: boolean;
  isActivated: boolean; // has any fund activated
  userActivation: UserActivation | null;
  activatedFunds: string[]; // list of activated fund types
  isFundActive: (fund: string) => boolean;
  isLoading: boolean;
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  bankAccountsLS: BankAccountLS[];
  bankAccounts: BankAccountLS[];
  transactions: TransactionData[];
  withdrawals: WithdrawalData[];
  adminCommissionBalance: number; // localStorage-based for admin
  commissionBalance: number; // 0 for users, localStorage for admin
  fundSessions: FundSessionData[];
  supportLink: string;
  activeFundSessions: Record<string, { sessionId: string; fundType: string }>;
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

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived activation state
  const activatedFunds = isAdmin
    ? ["gaming", "stock", "mix", "political", "all"]
    : userActivation?.isActive
      ? userActivation.activatedFunds
      : [];

  const isActivated =
    isAdmin || (userActivation?.isActive === true && activatedFunds.length > 0);

  const isFundActive = (fund: string): boolean => {
    if (isAdmin) return true;
    return activatedFunds.includes(fund) || activatedFunds.includes("all");
  };

  const commissionBalance = isAdmin ? adminCommissionBalance : 0;

  const setActiveFundSession = (
    bankId: string,
    sessionId: string,
    fundType: string,
  ) => {
    LocalStore.saveLiveSession(bankId, sessionId, fundType);
    setActiveFundSessionsState((prev) => ({
      ...prev,
      [bankId]: { sessionId, fundType },
    }));
  };

  const clearFundSession = (bankId: string) => {
    LocalStore.removeLiveSession(bankId);
    setActiveFundSessionsState((prev) => {
      const n = { ...prev };
      delete n[bankId];
      return n;
    });
  };

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

  // Poll for admin deactivation (every 3 seconds for non-admin users)
  useEffect(() => {
    if (isAdmin) return;
    pollRef.current = setInterval(() => {
      const email = localStorage.getItem("kuber_user_email") ?? "";
      const act = LocalStore.getUserActivation(email);
      setUserActivationState(act);
      // Check if user was deleted by admin
      const users = LocalStore.getRegisteredUsers();
      if (!users.find((u) => u.email === email)) {
        // User was deleted - force logout
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
        activatedFunds,
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
