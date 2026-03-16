// Typed localStorage helpers for KUBER PANEL

export interface ActivationCodeLS {
  code: string;
  fundType: string;
  createdAt: string;
  isActive: boolean;
  usedByEmail?: string;
}

// Updated: supports multiple fund activations per user
export interface UserActivation {
  isActive: boolean; // false = admin deactivated
  activatedFunds: string[]; // e.g. ['gaming', 'stock']
  fundCodes: Record<string, string>; // fundType -> code used
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
  // Migrate old format (activatedFund string → activatedFunds array)
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
  const users = getRegisteredUsers();
  if (!users.find((u) => u.email === email)) {
    users.push({ email, password, registeredAt: new Date().toISOString() });
    localStorage.setItem("kuber_registered_users", JSON.stringify(users));
  }
}

export function deleteRegisteredUser(email: string): void {
  const users = getRegisteredUsers().filter((u) => u.email !== email);
  localStorage.setItem("kuber_registered_users", JSON.stringify(users));
  // Also remove activation
  removeUserActivation(email);
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

// --- Admin Commission Transaction Log ---

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
  // Keep last 200 entries
  localStorage.setItem(
    "kuber_admin_commission_log",
    JSON.stringify(log.slice(0, 200)),
  );
}
