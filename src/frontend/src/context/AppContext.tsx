import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  ActivationCode,
  BankAccountData,
  CommissionData,
  FundSessionData,
  TransactionData,
  UserProfile,
  WithdrawalData,
} from "../backend";
import { useActor } from "../hooks/useActor";

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
  userProfile: UserProfile | null;
  isLoading: boolean;
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  bankAccounts: BankAccountData[];
  transactions: TransactionData[];
  commissionBalance: number;
  commissionHistory: CommissionData[];
  withdrawals: WithdrawalData[];
  fundSessions: FundSessionData[];
  activationCodes: ActivationCode[];
  supportLink: string;
  allBankAccounts: BankAccountData[];
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

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [bankAccounts, setBankAccounts] = useState<BankAccountData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [commissionBalance, setCommissionBalance] = useState(0);
  const [commissionHistory, setCommissionHistory] = useState<CommissionData[]>(
    [],
  );
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [fundSessions, setFundSessions] = useState<FundSessionData[]>([]);
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([]);
  const [supportLink, setSupportLink] = useState(
    "https://t.me/+fUsY5uHRNeYyYmJl",
  );
  const [allBankAccounts, setAllBankAccounts] = useState<BankAccountData[]>([]);
  const [activeFundSessions, setActiveFundSessions] = useState<
    Record<string, { sessionId: string; fundType: string }>
  >({});

  const setActiveFundSession = (
    bankId: string,
    sessionId: string,
    fundType: string,
  ) => {
    setActiveFundSessions((prev) => ({
      ...prev,
      [bankId]: { sessionId, fundType },
    }));
  };

  const clearFundSession = (bankId: string) => {
    setActiveFundSessions((prev) => {
      const n = { ...prev };
      delete n[bankId];
      return n;
    });
  };

  const refresh = useCallback(async () => {
    if (!actor) return;
    try {
      const [profile, banks, txns, bal, commHist, wds, sessions, link] =
        await Promise.all([
          actor.getCallerUserProfile().catch(() => null),
          actor.getBankAccounts().catch(() => []),
          actor.getTransactions().catch(() => []),
          actor.getCommissionBalance().catch(() => 0),
          actor.getCommissionHistory().catch(() => []),
          actor.getWithdrawals().catch(() => []),
          actor.getFundSessions().catch(() => []),
          actor.getSupportLink().catch(() => "https://t.me/+fUsY5uHRNeYyYmJl"),
        ]);
      setUserProfile(profile);
      setBankAccounts(banks);
      setTransactions(txns);
      setCommissionBalance(bal);
      setCommissionHistory(commHist);
      setWithdrawals(wds);
      setFundSessions(sessions);
      setSupportLink(link);

      if (isAdmin) {
        const [allBanks, codes] = await Promise.all([
          actor.getAllBankAccounts().catch(() => []),
          actor.getAllActivationCodes().catch(() => []),
        ]);
        setAllBankAccounts(allBanks);
        setActivationCodes(codes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [actor, isAdmin]);

  useEffect(() => {
    if (actor) {
      setIsLoading(true);
      refresh();
    } else {
      setIsLoading(false);
    }
  }, [actor, refresh]);

  const logout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  return (
    <AppContext.Provider
      value={{
        isAdmin,
        userProfile,
        isLoading,
        activeSection,
        setActiveSection,
        bankAccounts,
        transactions,
        commissionBalance,
        commissionHistory,
        withdrawals,
        fundSessions,
        activationCodes,
        supportLink,
        allBankAccounts,
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
