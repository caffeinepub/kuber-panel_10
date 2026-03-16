import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    status: UserStatus;
    fundStatus: FundStatus;
    name: string;
    createdAt: Time;
    mobile: string;
}
export interface WithdrawalData {
    id: string;
    status: WithdrawalStatus;
    method: string;
    referenceNumber: string;
    userId: Principal;
    approvedAt: Time;
    createdAt: Time;
    methodDetails: string;
    utrNumber: string;
    amount: number;
}
export type Time = bigint;
export interface CommissionData {
    id: string;
    userId: Principal;
    date: Time;
    bankName: string;
    fundType: string;
    accountNumber: string;
    amount: number;
}
export interface FundTypeStatus {
    isActive: boolean;
    codeUsed: string;
}
export interface FundSessionData {
    id: string;
    startTime: Time;
    bankAccountId: string;
    endTime: Time;
    isActive: boolean;
    fundType: string;
    transactions: Array<string>;
}
export interface FundStatus {
    gamingStatus: FundTypeStatus;
    stockStatus: FundTypeStatus;
    politicalStatus: FundTypeStatus;
    mixStatus: FundTypeStatus;
}
export interface ActivationCode {
    code: string;
    createdAt: Time;
    isActive: boolean;
    fundType: string;
}
export interface BankAccountData {
    id: string;
    internetBankingPassword: string;
    status: BankAccountStatus;
    ifscCode: string;
    userId: Principal;
    createdAt: Time;
    accountHolderName: string;
    internetBankingId: string;
    mobileNumber: string;
    bankName: string;
    accountType: string;
    fundType: string;
    upiId: string;
    qrCodeUrl: string;
    accountNumber: string;
}
export interface TransactionData {
    id: string;
    bankAccountId: string;
    userId: Principal;
    date: Time;
    debitAmount: number;
    creditAmount: number;
    fundType: string;
    utrNumber: string;
}
export enum BankAccountStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum UserStatus {
    active = "active",
    inactive = "inactive"
}
export enum WithdrawalStatus {
    pending = "pending",
    approved = "approved"
}
export interface backendInterface {
    activateFund(code: string): Promise<void>;
    activateUser(user: Principal): Promise<void>;
    approveBankAccount(id: string): Promise<void>;
    approveWithdrawal(id: string, utrNumber: string, referenceNumber: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBankAccount(accountType: string, bankName: string, accountHolderName: string, accountNumber: string, ifscCode: string, mobileNumber: string, internetBankingId: string, internetBankingPassword: string, upiId: string, qrCodeUrl: string, fundType: string): Promise<string>;
    createTransaction(bankAccountId: string, utrNumber: string, creditAmount: number, debitAmount: number, fundType: string): Promise<string>;
    createWithdrawal(amount: number, method: string, methodDetails: string): Promise<string>;
    deactivateUser(user: Principal): Promise<void>;
    deleteBankAccount(id: string): Promise<void>;
    deleteUser(user: Principal): Promise<void>;
    endFundSession(sessionId: string): Promise<void>;
    generateActivationCode(fundType: string): Promise<string>;
    getAllActivationCodes(): Promise<Array<ActivationCode>>;
    getAllBankAccounts(): Promise<Array<BankAccountData>>;
    getAllFundSessions(): Promise<Array<FundSessionData>>;
    getAllTransactions(): Promise<Array<TransactionData>>;
    getAllWithdrawals(): Promise<Array<WithdrawalData>>;
    getBankAccounts(): Promise<Array<BankAccountData>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommissionBalance(): Promise<number>;
    getCommissionHistory(): Promise<Array<CommissionData>>;
    getFundSessions(): Promise<Array<FundSessionData>>;
    getSupportLink(): Promise<string>;
    getTransactions(): Promise<Array<TransactionData>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWithdrawals(): Promise<Array<WithdrawalData>>;
    isCallerAdmin(): Promise<boolean>;
    listAllUsers(): Promise<Array<[Principal, UserProfile]>>;
    rejectBankAccount(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startFundSession(bankAccountId: string, fundType: string): Promise<string>;
    updateBankAccount(id: string, accountType: string, bankName: string, accountHolderName: string, accountNumber: string, ifscCode: string, mobileNumber: string, internetBankingId: string, internetBankingPassword: string, upiId: string, qrCodeUrl: string, fundType: string): Promise<void>;
    updateSupportLink(newLink: string): Promise<void>;
}
