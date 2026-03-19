# KUBER PANEL

## Current State
Full-stack financial dashboard app with live fund activity, withdrawal receipts (bank/UPI/USDT), bank statement, admin user management, bank approval, and generated codes. Data stored in localStorage with canister fallback.

## Requested Changes (Diff)

### Add
- Capital AM/PM helper function used everywhere time is displayed (panel, receipts, statements, commission)
- Copy buttons in withdrawal details modal for UTR, TXN ID, RRN, Wallet Hash, Wallet Address (NOT in printed receipt)
- Search/filter bar in bank statement
- Download PDF button below each session block in bank statement
- UTR copy button in bank statement table
- USDT: network fee field (based on amount), confirmation number field
- Auto-clear orphaned live fund sessions (where bank was deleted) on app initialization
- Registration sentinel saved to canister on every user login for cross-device admin visibility

### Modify
- (Issue 1) AppContext: On init, auto-clear activeFundSessions where the bankId no longer exists in bankAccountsLS. In runTick, verify bank still exists before creating transaction. This stops the ghost auto-transactions.
- (Issue 2) WithdrawalHistory receipt:
  - Success header: Replace "✓ SUCCESS" text badge with green CheckCircle icon + "Transaction Successful"
  - Status field: UPI/IMPS → "COMPLETE"; NEFT/RTGS → "SETTLED"
  - Branch: full city name (from IFSC) + full bank name on one line
  - NEFT/RTGS/UPI/IMPS: real-style transaction IDs already done; ensure UTR/TXN/RRN copy buttons in modal only
- (Issue 3) USDT withdrawal:
  - TXN Hash: prefix with 0x (64 hex chars)
  - Copy button for TXN Hash and Wallet Address in details modal
  - Amount format: "X USDT" (not ₮X)
  - INR line: "≈ ₹X" (simple, no "convert" word)
  - Network: "TRON (TRC20)" not "TRC20 (TRON)"
  - Add Network Fee row (1 USDT for <100, 2 USDT for 100-1000, 5 USDT for >1000)
  - Add Confirmation number row (random 1–15)
  - Wallet address: show on-chain note
  - WithdrawalSection: fix network display to "TRON (TRC20)", fix INR hint to "≈ ₹X"
- (Issue 4) All time displays: uppercase AM/PM via helper replacing all toLocaleTimeString calls
- (Issue 5) BankStatement:
  - Remove fund-type badge from session card header (it was showing fund name)
  - Each session card shows full bank name + A/C + IFSC + branch
  - Consistent padding across all rows
  - Thin subtle dividers between rows
  - Download PDF per session button
  - UTR copy icon per row
  - Search/filter input at top
- (Issue 6) UserManagement + BankApproval:
  - On user login/init: save registration sentinel `addBankAccount` with `__USER_REG__` marker to canister so admin cross-device sees all users
  - UserManagement: also scan localStorage `kuber_withdrawal_history` for user emails
  - BankApproval: more aggressive canister poll + ensure new banks show immediately

### Remove
- "fund name" text/badge from bank statement session block subtitle (per user: "fund name likha aa raha hai niche statement usko remove krdo")
- "convert" word from USDT INR conversion display
- "TRC20 (TRON)" → replaced with "TRON (TRC20)"

## Implementation Plan
1. Create `fmtTimeAMPM(date)` helper in a utils file, apply it everywhere time is shown
2. AppContext.tsx: fix orphaned session cleanup on init + runTick bank existence check + ensure user registration sentinel is sent to canister
3. WithdrawalHistory.tsx: overhaul buildReceiptRows, success badge, add copy buttons in modal for UTR/TXN/RRN/hash/wallet
4. WithdrawalSection.tsx: fix USDT display (TRON (TRC20), ≈ ₹X, no "convert")
5. BankStatement.tsx: search bar, copy UTR, download per-session, remove fund badge, full bank details, thin dividers, consistent padding
6. UserManagement.tsx + BankApproval.tsx: improve cross-device sync
