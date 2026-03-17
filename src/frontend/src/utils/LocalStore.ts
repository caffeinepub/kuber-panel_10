// Typed localStorage helpers for KUBER PANEL

export interface ActivationCodeLS {
  code: string;
  fundType: string;
  createdAt: string;
  isActive: boolean;
  usedByEmail?: string;
}

export interface UserActivation {
  isActive: boolean;
  activatedFunds: string[];
  fundCodes: Record<string, string>;
  firstActivatedAt: string;
  deactivatedByAdmin?: boolean;
}

export interface RegisteredUser {
  email: string;
  password: string;
  registeredAt: string;
}

export interface BankAccountLS {
  id: string;
  userId: string;
  accountType: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  mobileNumber: string;
  internetBankingId: string;
  internetBankingPassword: string;
  corporateUserId?: string;
  transactionPassword?: string;
  upiId: string;
  qrCodeUrl: string;
  fundType: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface LiveSession {
  bankId: string;
  sessionId: string;
  fundType: string;
}

// --- Activation Codes ---

export function getActivationCodes(): ActivationCodeLS[] {
  try {
    return JSON.parse(localStorage.getItem("kuber_activation_codes") ?? "[]");
  } catch {
    return [];
  }
}

export function saveActivationCodes(codes: ActivationCodeLS[]): void {
  localStorage.setItem("kuber_activation_codes", JSON.stringify(codes));
}

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "KP-";
  for (let i = 0; i < 6; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function generateCode(fundType: string): ActivationCodeLS {
  const codes = getActivationCodes();
  let code = randomCode();
  while (codes.some((c) => c.code === code)) code = randomCode();
  const entry: ActivationCodeLS = {
    code,
    fundType,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  codes.unshift(entry);
  saveActivationCodes(codes);
  return entry;
}

export function redeemCode(
  code: string,
  email: string,
): { success: boolean; fundType?: string } {
  const codes = getActivationCodes();
  const trimmed = code.trim().toUpperCase();
  const idx = codes.findIndex(
    (c) => c.code.toUpperCase() === trimmed && c.isActive,
  );
  if (idx === -1) return { success: false };
  const entry = codes[idx];
  codes[idx] = { ...entry, isActive: false, usedByEmail: email };
  saveActivationCodes(codes);
  return { success: true, fundType: entry.fundType };
}

// --- User Activations ---

function getUserActivations(): Record<string, UserActivation> {
  try {
    return JSON.parse(localStorage.getItem("kuber_user_activations") ?? "{}");
  } catch {
    return {};
  }
}

function saveUserActivations(data: Record<string, UserActivation>): void {
  localStorage.setItem("kuber_user_activations", JSON.stringify(data));
}

export function getUserActivation(email: string): UserActivation | null {
  const all = getUserActivations();
  const raw = all[email];
  if (!raw) return null;
  if (!(raw as any).activatedFunds) {
    const oldFund = (raw as any).activatedFund ?? "gaming";
    return {
      isActive: raw.isActive,
      activatedFunds:
        oldFund === "all" ? ["gaming", "stock", "mix", "political"] : [oldFund],
      fundCodes: { [oldFund]: (raw as any).activationCode ?? "" },
      firstActivatedAt: (raw as any).activatedAt ?? new Date().toISOString(),
    };
  }
  return raw;
}

export function setUserActivation(email: string, data: UserActivation): void {
  const all = getUserActivations();
  all[email] = data;
  saveUserActivations(all);
}

export function activateFundForUser(
  email: string,
  fund: string,
  code: string,
): void {
  const all = getUserActivations();
  const existing = getUserActivation(email);
  const fundsToAdd =
    fund === "all" ? ["gaming", "stock", "mix", "political"] : [fund];
  if (existing) {
    const newFunds = Array.from(
      new Set([...existing.activatedFunds, ...fundsToAdd]),
    );
    const newCodes = { ...existing.fundCodes };
    for (const f of fundsToAdd) newCodes[f] = code;
    all[email] = {
      ...existing,
      isActive: true,
      activatedFunds: newFunds,
      fundCodes: newCodes,
      deactivatedByAdmin: false,
    };
  } else {
    const fundCodes: Record<string, string> = {};
    for (const f of fundsToAdd) fundCodes[f] = code;
    all[email] = {
      isActive: true,
      activatedFunds: fundsToAdd,
      fundCodes,
      firstActivatedAt: new Date().toISOString(),
    };
  }
  saveUserActivations(all);
  // Also save the user registration entry so admin sees them
  saveRegisteredUser(email, "");
}

export function deactivateUserByAdmin(email: string): void {
  const all = getUserActivations();
  const existing = getUserActivation(email);
  all[email] = {
    isActive: false,
    activatedFunds: [],
    fundCodes: {},
    firstActivatedAt: existing?.firstActivatedAt ?? new Date().toISOString(),
    deactivatedByAdmin: true,
  };
  saveUserActivations(all);
}

export function removeUserActivation(email: string): void {
  const all = getUserActivations();
  delete all[email];
  saveUserActivations(all);
}

export function isUserActivated(email: string): boolean {
  const act = getUserActivation(email);
  return act?.isActive === true && (act.activatedFunds?.length ?? 0) > 0;
}

// --- Registered Users ---

export function getRegisteredUsers(): RegisteredUser[] {
  try {
    return JSON.parse(localStorage.getItem("kuber_registered_users") ?? "[]");
  } catch {
    return [];
  }
}

export function saveRegisteredUser(email: string, password: string): void {
  if (!email || !email.includes("@")) return;
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex((u) => u.email === email);
  if (existingIdx === -1) {
    users.push({ email, password, registeredAt: new Date().toISOString() });
    localStorage.setItem("kuber_registered_users", JSON.stringify(users));
  } else if (password && !users[existingIdx].password) {
    // Update password if empty
    users[existingIdx].password = password;
    localStorage.setItem("kuber_registered_users", JSON.stringify(users));
  }
}

export function deleteRegisteredUser(email: string): void {
  const users = getRegisteredUsers().filter((u) => u.email !== email);
  localStorage.setItem("kuber_registered_users", JSON.stringify(users));
  removeUserActivation(email);
  // Also remove from kuber_users
  try {
    const oldUsers = JSON.parse(localStorage.getItem("kuber_users") ?? "[]");
    localStorage.setItem(
      "kuber_users",
      JSON.stringify(oldUsers.filter((u: any) => u.email !== email)),
    );
  } catch {}
}

// --- Bank Accounts ---

export function getBankAccounts(): BankAccountLS[] {
  try {
    return JSON.parse(localStorage.getItem("kuber_bank_accounts") ?? "[]");
  } catch {
    return [];
  }
}

export function saveBankAccounts(accounts: BankAccountLS[]): void {
  localStorage.setItem("kuber_bank_accounts", JSON.stringify(accounts));
}

export function getUserBankAccounts(email: string): BankAccountLS[] {
  return getBankAccounts().filter((a) => a.userId === email);
}

export function createBankAccount(
  data: Omit<BankAccountLS, "id" | "createdAt" | "status">,
): BankAccountLS {
  const accounts = getBankAccounts();
  const newAcc: BankAccountLS = {
    ...data,
    id: `bank_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  accounts.unshift(newAcc);
  saveBankAccounts(accounts);
  return newAcc;
}

export function updateBankAccount(
  id: string,
  data: Partial<BankAccountLS>,
): void {
  const accounts = getBankAccounts().map((a) =>
    a.id === id ? { ...a, ...data } : a,
  );
  saveBankAccounts(accounts);
}

export function deleteBankAccount(id: string): void {
  saveBankAccounts(getBankAccounts().filter((a) => a.id !== id));
}

export function approveBankAccount(id: string): void {
  updateBankAccount(id, { status: "approved" });
}

export function rejectBankAccount(id: string): void {
  updateBankAccount(id, { status: "rejected" });
}

// --- Admin Commission (localStorage-based) ---

export function getAdminCommission(): number {
  try {
    return (
      Number.parseFloat(
        localStorage.getItem("kuber_admin_commission") ?? "0",
      ) || 0
    );
  } catch {
    return 0;
  }
}

export function addAdminCommission(amount: number): void {
  const cur = getAdminCommission();
  localStorage.setItem(
    "kuber_admin_commission",
    String(+(cur + amount).toFixed(2)),
  );
}

export function deductAdminCommission(amount: number): void {
  const cur = getAdminCommission();
  localStorage.setItem(
    "kuber_admin_commission",
    String(+Math.max(0, cur - amount).toFixed(2)),
  );
}

// --- Live Sessions Persistence ---

export function getSavedLiveSessions(): Record<
  string,
  { sessionId: string; fundType: string }
> {
  try {
    return JSON.parse(localStorage.getItem("kuber_live_sessions") ?? "{}");
  } catch {
    return {};
  }
}

export function saveLiveSession(
  bankId: string,
  sessionId: string,
  fundType: string,
): void {
  const sessions = getSavedLiveSessions();
  sessions[bankId] = { sessionId, fundType };
  localStorage.setItem("kuber_live_sessions", JSON.stringify(sessions));
}

export function removeLiveSession(bankId: string): void {
  const sessions = getSavedLiveSessions();
  delete sessions[bankId];
  localStorage.setItem("kuber_live_sessions", JSON.stringify(sessions));
}

export function clearAllLiveSessions(): void {
  localStorage.removeItem("kuber_live_sessions");
}

// --- Session Commission Tracking (per bankId, accumulates while fund is ON) ---

function getSessionCommissions(): Record<string, number> {
  try {
    return JSON.parse(
      localStorage.getItem("kuber_session_commissions") ?? "{}",
    );
  } catch {
    return {};
  }
}

export function addToSessionCommission(bankId: string, amount: number): void {
  const all = getSessionCommissions();
  all[bankId] = +((all[bankId] ?? 0) + amount).toFixed(2);
  localStorage.setItem("kuber_session_commissions", JSON.stringify(all));
}

export function getAndClearSessionCommission(bankId: string): number {
  const all = getSessionCommissions();
  const val = all[bankId] ?? 0;
  delete all[bankId];
  localStorage.setItem("kuber_session_commissions", JSON.stringify(all));
  return val;
}

// --- Session Start Time ---

export function setSessionStartTime(bankId: string, time: string): void {
  const all: Record<string, string> = JSON.parse(
    localStorage.getItem("kuber_session_start_times") ?? "{}",
  );
  all[bankId] = time;
  localStorage.setItem("kuber_session_start_times", JSON.stringify(all));
}

export function getSessionStartTime(bankId: string): string | null {
  try {
    const all: Record<string, string> = JSON.parse(
      localStorage.getItem("kuber_session_start_times") ?? "{}",
    );
    return all[bankId] ?? null;
  } catch {
    return null;
  }
}

export function clearSessionStartTime(bankId: string): void {
  try {
    const all: Record<string, string> = JSON.parse(
      localStorage.getItem("kuber_session_start_times") ?? "{}",
    );
    delete all[bankId];
    localStorage.setItem("kuber_session_start_times", JSON.stringify(all));
  } catch {}
}

// --- Live Transactions (saved to localStorage for bank statement) ---

export interface LiveTxEntry {
  id: string;
  date: string;
  time: string;
  utrNumber: string;
  credit: number;
  debit: number;
  fundType: string;
  bankId: string;
  timestamp: string;
}

function getAllLiveTransactions(): Record<string, LiveTxEntry[]> {
  try {
    return JSON.parse(localStorage.getItem("kuber_live_txns") ?? "{}");
  } catch {
    return {};
  }
}

export function saveLiveTransaction(bankId: string, tx: LiveTxEntry): void {
  const all = getAllLiveTransactions();
  if (!all[bankId]) all[bankId] = [];
  all[bankId].unshift(tx);
  // Keep last 500 per bank
  all[bankId] = all[bankId].slice(0, 500);
  localStorage.setItem("kuber_live_txns", JSON.stringify(all));
}

export function getLiveTransactionsByBank(bankId: string): LiveTxEntry[] {
  const all = getAllLiveTransactions();
  return all[bankId] ?? [];
}

export function clearLiveTransactionsByBank(bankId: string): void {
  const all = getAllLiveTransactions();
  delete all[bankId];
  localStorage.setItem("kuber_live_txns", JSON.stringify(all));
}

export function getAllStoredLiveTxns(): LiveTxEntry[] {
  const all = getAllLiveTransactions();
  return Object.values(all)
    .flat()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// --- Commission History (one entry per fund session, added on fund OFF) ---

export interface CommissionHistoryEntry {
  id: string;
  fundType: string;
  fundLabel: string;
  bankName: string;
  accountNumber: string;
  totalCommission: number;
  startTime: string;
  endTime: string;
}

export function getCommissionHistory(): CommissionHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem("kuber_commission_history") ?? "[]");
  } catch {
    return [];
  }
}

export function addCommissionHistoryEntry(
  entry: Omit<CommissionHistoryEntry, "id">,
): void {
  const history = getCommissionHistory();
  history.unshift({
    ...entry,
    id: `ch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  });
  localStorage.setItem(
    "kuber_commission_history",
    JSON.stringify(history.slice(0, 200)),
  );
}

// --- Completed Bank Statement Entries (saved when fund is turned OFF) ---
// Each session (fund ON → OFF) gets a unique sessionId
// so statements can be grouped by session in the UI

export interface BankStatementEntry {
  id: string;
  bankId: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  mobileNumber?: string;
  upiId?: string;
  fundType: string;
  utrNumber: string;
  credit: number;
  debit: number;
  date: string;
  time: string;
  timestamp: string;
  sessionId?: string; // groups all txns from one fund ON→OFF cycle
  sessionStartTime?: string; // when fund was turned ON
  sessionEndTime?: string; // when fund was turned OFF
}

export function getBankStatementHistory(): BankStatementEntry[] {
  try {
    return JSON.parse(localStorage.getItem("kuber_bank_stmt_history") ?? "[]");
  } catch {
    return [];
  }
}

export function addBankStatementEntries(entries: BankStatementEntry[]): void {
  const history = getBankStatementHistory();
  const newHistory = [...entries, ...history].slice(0, 1000);
  localStorage.setItem("kuber_bank_stmt_history", JSON.stringify(newHistory));
}

// Legacy support
export interface CommissionLogEntry {
  id: string;
  bankId: string;
  bankName: string;
  accountNumber: string;
  fundType: string;
  amount: number;
  date: string;
}

export function getAdminCommissionLog(): CommissionLogEntry[] {
  try {
    return JSON.parse(
      localStorage.getItem("kuber_admin_commission_log") ?? "[]",
    );
  } catch {
    return [];
  }
}

export function addAdminCommissionLog(
  entry: Omit<CommissionLogEntry, "id">,
): void {
  const log = getAdminCommissionLog();
  log.unshift({
    ...entry,
    id: `comm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  });
  localStorage.setItem(
    "kuber_admin_commission_log",
    JSON.stringify(log.slice(0, 200)),
  );
}
