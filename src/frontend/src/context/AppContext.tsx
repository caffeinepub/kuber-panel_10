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
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [isAdmin, setIsAdmin] = useState(false);
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
    if (!actor || !identity) return;
    try {
      const [admin, profile, banks, txns, bal, commHist, wds, sessions, link] =
        await Promise.all([
          actor.isCallerAdmin(),
          actor.getCallerUserProfile(),
          actor.getBankAccounts(),
          actor.getTransactions(),
          actor.getCommissionBalance(),
          actor.getCommissionHistory(),
          actor.getWithdrawals(),
          actor.getFundSessions(),
          actor.getSupportLink(),
        ]);
      setIsAdmin(admin);
      setUserProfile(profile);
      setBankAccounts(banks);
      setTransactions(txns);
      setCommissionBalance(bal);
      setCommissionHistory(commHist);
      setWithdrawals(wds);
      setFundSessions(sessions);
      setSupportLink(link);

      if (admin) {
        const [allBanks, codes] = await Promise.all([
          actor.getAllBankAccounts(),
          actor.getAllActivationCodes(),
        ]);
        setAllBankAccounts(allBanks);
        setActivationCodes(codes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [actor, identity]);

  useEffect(() => {
    if (actor && identity) {
      setIsLoading(true);
      refresh();
    } else {
      setIsLoading(false);
    }
  }, [actor, identity, refresh]);

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
