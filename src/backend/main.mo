import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Option "mo:core/Option";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  
  // Include file storage
  include MixinStorage();

  // Support link
  var supportLink : Text = "https://t.me/+fUsY5uHRNeYyYmJl";

  // Type definitions
  public type BankAccountStatus = { #pending; #approved; #rejected };
  public type UserStatus = { #active; #inactive };
  public type WithdrawalStatus = { #pending; #approved };

  public type FundTypeStatus = {
    isActive : Bool;
    codeUsed : Text;
  };

  public type FundStatus = {
    gamingStatus : FundTypeStatus;
    stockStatus : FundTypeStatus;
    mixStatus : FundTypeStatus;
    politicalStatus : FundTypeStatus;
  };

  public type FundTypeStatusInput = {
    isActive : Bool;
    codeUsed : Text;
  };

  public type FundStatusInput = {
    gamingStatus : FundTypeStatusInput;
    stockStatus : FundTypeStatusInput;
    mixStatus : FundTypeStatusInput;
    politicalStatus : FundTypeStatusInput;
  };

  public type UserProfile = {
    name : Text;
    mobile : Text;
    status : UserStatus;
    fundStatus : FundStatus;
    createdAt : Time.Time;
  };

  public type BankAccountData = {
    id : Text;
    accountType : Text;
    bankName : Text;
    accountHolderName : Text;
    accountNumber : Text;
    ifscCode : Text;
    mobileNumber : Text;
    internetBankingId : Text;
    internetBankingPassword : Text;
    upiId : Text;
    qrCodeUrl : Text;
    status : BankAccountStatus;
    fundType : Text;
    userId : Principal;
    createdAt : Time.Time;
  };

  public type TransactionData = {
    id : Text;
    bankAccountId : Text;
    userId : Principal;
    utrNumber : Text;
    creditAmount : Float;
    debitAmount : Float;
    date : Time.Time;
    fundType : Text;
  };

  public type CommissionData = {
    id : Text;
    userId : Principal;
    date : Time.Time;
    bankName : Text;
    accountNumber : Text;
    amount : Float;
    fundType : Text;
  };

  public type WithdrawalData = {
    id : Text;
    userId : Principal;
    amount : Float;
    method : Text;
    methodDetails : Text;
    status : WithdrawalStatus;
    utrNumber : Text;
    referenceNumber : Text;
    createdAt : Time.Time;
    approvedAt : Time.Time;
  };

  public type FundSessionData = {
    id : Text;
    bankAccountId : Text;
    fundType : Text;
    isActive : Bool;
    startTime : Time.Time;
    endTime : Time.Time;
    transactions : [Text];
  };

  public type ActivationCode = {
    code : Text;
    fundType : Text;
    isActive : Bool;
    createdAt : Time.Time;
  };

  // Data storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let bankAccounts = Map.empty<Text, BankAccountData>();
  let transactions = Map.empty<Text, TransactionData>();
  let commissions = Map.empty<Text, CommissionData>();
  let withdrawals = Map.empty<Text, WithdrawalData>();
  let fundSessions = Map.empty<Text, FundSessionData>();
  let activationCodes = Map.empty<Text, ActivationCode>();
  let commissionBalances = Map.empty<Principal, Float>();

  var nextBankAccountId : Nat = 1;
  var nextTransactionId : Nat = 1;
  var nextCommissionId : Nat = 1;
  var nextWithdrawalId : Nat = 1;
  var nextSessionId : Nat = 1;

  // Commission rates
  let commissionRates = {
    gaming = 0.15;
    stock = 0.30;
    mix = 0.30;
    political = 0.25;
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Bank Account Management
  public shared ({ caller }) func createBankAccount(
    accountType : Text,
    bankName : Text,
    accountHolderName : Text,
    accountNumber : Text,
    ifscCode : Text,
    mobileNumber : Text,
    internetBankingId : Text,
    internetBankingPassword : Text,
    upiId : Text,
    qrCodeUrl : Text,
    fundType : Text
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bank accounts");
    };

    let id = nextBankAccountId.toText();
    nextBankAccountId += 1;

    let account : BankAccountData = {
      id;
      accountType;
      bankName;
      accountHolderName;
      accountNumber;
      ifscCode;
      mobileNumber;
      internetBankingId;
      internetBankingPassword;
      upiId;
      qrCodeUrl;
      status = #pending;
      fundType;
      userId = caller;
      createdAt = Time.now();
    };

    bankAccounts.add(id, account);
    id;
  };

  public shared ({ caller }) func updateBankAccount(
    id : Text,
    accountType : Text,
    bankName : Text,
    accountHolderName : Text,
    accountNumber : Text,
    ifscCode : Text,
    mobileNumber : Text,
    internetBankingId : Text,
    internetBankingPassword : Text,
    upiId : Text,
    qrCodeUrl : Text,
    fundType : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update bank accounts");
    };

    switch (bankAccounts.get(id)) {
      case (null) { Runtime.trap("Bank account not found") };
      case (?account) {
        if (account.userId != caller) {
          Runtime.trap("Unauthorized: Can only update your own bank accounts");
        };
        if (account.status != #pending) {
          Runtime.trap("Can only edit bank accounts with pending status");
        };

        let updated : BankAccountData = {
          id = account.id;
          accountType;
          bankName;
          accountHolderName;
          accountNumber;
          ifscCode;
          mobileNumber;
          internetBankingId;
          internetBankingPassword;
          upiId;
          qrCodeUrl;
          status = account.status;
          fundType;
          userId = account.userId;
          createdAt = account.createdAt;
        };
        bankAccounts.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteBankAccount(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete bank accounts");
    };

    switch (bankAccounts.get(id)) {
      case (null) { Runtime.trap("Bank account not found") };
      case (?account) {
        if (account.userId != caller) {
          Runtime.trap("Unauthorized: Can only delete your own bank accounts");
        };
        if (account.status != #pending) {
          Runtime.trap("Can only delete bank accounts with pending status");
        };
        bankAccounts.remove(id);
      };
    };
  };

  public query ({ caller }) func getBankAccounts() : async [BankAccountData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bank accounts");
    };

    let accounts = bankAccounts.values().toArray().filter(
      func(account) { account.userId == caller }
    );
    accounts;
  };

  public shared ({ caller }) func approveBankAccount(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve bank accounts");
    };

    switch (bankAccounts.get(id)) {
      case (null) { Runtime.trap("Bank account not found") };
      case (?account) {
        let updated : BankAccountData = {
          id = account.id;
          accountType = account.accountType;
          bankName = account.bankName;
          accountHolderName = account.accountHolderName;
          accountNumber = account.accountNumber;
          ifscCode = account.ifscCode;
          mobileNumber = account.mobileNumber;
          internetBankingId = account.internetBankingId;
          internetBankingPassword = account.internetBankingPassword;
          upiId = account.upiId;
          qrCodeUrl = account.qrCodeUrl;
          status = #approved;
          fundType = account.fundType;
          userId = account.userId;
          createdAt = account.createdAt;
        };
        bankAccounts.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func rejectBankAccount(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject bank accounts");
    };

    switch (bankAccounts.get(id)) {
      case (null) { Runtime.trap("Bank account not found") };
      case (?account) {
        let updated : BankAccountData = {
          id = account.id;
          accountType = account.accountType;
          bankName = account.bankName;
          accountHolderName = account.accountHolderName;
          accountNumber = account.accountNumber;
          ifscCode = account.ifscCode;
          mobileNumber = account.mobileNumber;
          internetBankingId = account.internetBankingId;
          internetBankingPassword = account.internetBankingPassword;
          upiId = account.upiId;
          qrCodeUrl = account.qrCodeUrl;
          status = #rejected;
          fundType = account.fundType;
          userId = account.userId;
          createdAt = account.createdAt;
        };
        bankAccounts.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getAllBankAccounts() : async [BankAccountData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bank accounts");
    };
    bankAccounts.values().toArray();
  };

  // Transaction Management
  public shared ({ caller }) func createTransaction(
    bankAccountId : Text,
    utrNumber : Text,
    creditAmount : Float,
    debitAmount : Float,
    fundType : Text
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create transactions");
    };

    switch (bankAccounts.get(bankAccountId)) {
      case (null) { Runtime.trap("Bank account not found") };
      case (?account) {
        if (account.userId != caller) {
          Runtime.trap("Unauthorized: Can only create transactions for your own bank accounts");
        };
      };
    };

    let id = nextTransactionId.toText();
    nextTransactionId += 1;

    let transaction : TransactionData = {
      id;
      bankAccountId;
      userId = caller;
      utrNumber;
      creditAmount;
      debitAmount;
      date = Time.now();
      fundType;
    };

    transactions.add(id, transaction);
    id;
  };

  public query ({ caller }) func getTransactions() : async [TransactionData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    let userTransactions = transactions.values().toArray().filter(
      func(tx) { tx.userId == caller }
    );
    userTransactions;
  };

  public query ({ caller }) func getAllTransactions() : async [TransactionData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };
    transactions.values().toArray();
  };

  // Commission Management
  public query ({ caller }) func getCommissionBalance() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view commission balance");
    };

    switch (commissionBalances.get(caller)) {
      case (null) { 0.0 };
      case (?balance) { balance };
    };
  };

  public query ({ caller }) func getCommissionHistory() : async [CommissionData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view commission history");
    };

    let userCommissions = commissions.values().toArray().filter(
      func(comm) { comm.userId == caller }
    );
    userCommissions;
  };

  // Withdrawal Management
  public shared ({ caller }) func createWithdrawal(
    amount : Float,
    method : Text,
    methodDetails : Text
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create withdrawals");
    };

    let id = nextWithdrawalId.toText();
    nextWithdrawalId += 1;

    let withdrawal : WithdrawalData = {
      id;
      userId = caller;
      amount;
      method;
      methodDetails;
      status = #pending;
      utrNumber = "";
      referenceNumber = "";
      createdAt = Time.now();
      approvedAt = 0;
    };

    withdrawals.add(id, withdrawal);
    id;
  };

  public query ({ caller }) func getWithdrawals() : async [WithdrawalData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view withdrawals");
    };

    let userWithdrawals = withdrawals.values().toArray().filter(
      func(w) { w.userId == caller }
    );
    userWithdrawals;
  };

  public shared ({ caller }) func approveWithdrawal(id : Text, utrNumber : Text, referenceNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };

    switch (withdrawals.get(id)) {
      case (null) { Runtime.trap("Withdrawal not found") };
      case (?withdrawal) {
        let updated : WithdrawalData = {
          id = withdrawal.id;
          userId = withdrawal.userId;
          amount = withdrawal.amount;
          method = withdrawal.method;
          methodDetails = withdrawal.methodDetails;
          status = #approved;
          utrNumber;
          referenceNumber;
          createdAt = withdrawal.createdAt;
          approvedAt = Time.now();
        };
        withdrawals.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getAllWithdrawals() : async [WithdrawalData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all withdrawals");
    };
    withdrawals.values().toArray();
  };

  // Activation Code Management
  public shared ({ caller }) func generateActivationCode(fundType : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate activation codes");
    };

    let code = "CODE-" # nextTransactionId.toText();
    nextTransactionId += 1;

    let activationCode : ActivationCode = {
      code;
      fundType;
      isActive = true;
      createdAt = Time.now();
    };

    activationCodes.add(code, activationCode);
    code;
  };

  public shared ({ caller }) func activateFund(code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can activate funds");
    };

    switch (activationCodes.get(code)) {
      case (null) { Runtime.trap("Invalid activation code") };
      case (?activationCode) {
        if (not activationCode.isActive) {
          Runtime.trap("Activation code already used");
        };

        // Mark code as used
        let updated : ActivationCode = {
          code = activationCode.code;
          fundType = activationCode.fundType;
          isActive = false;
          createdAt = activationCode.createdAt;
        };
        activationCodes.add(code, updated);

        // Update user profile with activated fund
        switch (userProfiles.get(caller)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profile) {
            let updatedFundStatus = updateFundStatusForType(profile.fundStatus, activationCode.fundType, code);
            let updatedProfile : UserProfile = {
              name = profile.name;
              mobile = profile.mobile;
              status = profile.status;
              fundStatus = updatedFundStatus;
              createdAt = profile.createdAt;
            };
            userProfiles.add(caller, updatedProfile);
          };
        };
      };
    };
  };

  private func updateFundStatusForType(fundStatus : FundStatus, fundType : Text, code : Text) : FundStatus {
    let activated : FundTypeStatus = { isActive = true; codeUsed = code };
    
    if (fundType == "gaming" or fundType == "all") {
      return {
        gamingStatus = activated;
        stockStatus = if (fundType == "all") { activated } else { fundStatus.stockStatus };
        mixStatus = if (fundType == "all") { activated } else { fundStatus.mixStatus };
        politicalStatus = if (fundType == "all") { activated } else { fundStatus.politicalStatus };
      };
    };
    
    if (fundType == "stock") {
      return {
        gamingStatus = fundStatus.gamingStatus;
        stockStatus = activated;
        mixStatus = fundStatus.mixStatus;
        politicalStatus = fundStatus.politicalStatus;
      };
    };
    
    if (fundType == "mix") {
      return {
        gamingStatus = fundStatus.gamingStatus;
        stockStatus = fundStatus.stockStatus;
        mixStatus = activated;
        politicalStatus = fundStatus.politicalStatus;
      };
    };
    
    if (fundType == "political") {
      return {
        gamingStatus = fundStatus.gamingStatus;
        stockStatus = fundStatus.stockStatus;
        mixStatus = fundStatus.mixStatus;
        politicalStatus = activated;
      };
    };
    
    fundStatus;
  };

  public query ({ caller }) func getAllActivationCodes() : async [ActivationCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view activation codes");
    };
    activationCodes.values().toArray();
  };

  // User Management (Admin)
  public query ({ caller }) func listAllUsers() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    userProfiles.entries().toArray();
  };

  public shared ({ caller }) func activateUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can activate users");
    };

    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updated : UserProfile = {
          name = profile.name;
          mobile = profile.mobile;
          status = #active;
          fundStatus = profile.fundStatus;
          createdAt = profile.createdAt;
        };
        userProfiles.add(user, updated);
      };
    };
  };

  public shared ({ caller }) func deactivateUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can deactivate users");
    };

    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updated : UserProfile = {
          name = profile.name;
          mobile = profile.mobile;
          status = #inactive;
          fundStatus = profile.fundStatus;
          createdAt = profile.createdAt;
        };
        userProfiles.add(user, updated);
      };
    };
  };

  public shared ({ caller }) func deleteUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    userProfiles.remove(user);
  };

  // Support Link Management
  public query func getSupportLink() : async Text {
    // Public access - no authorization needed
    supportLink;
  };

  public shared ({ caller }) func updateSupportLink(newLink : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update support link");
    };
    supportLink := newLink;
  };

  // Fund Session Management
  public shared ({ caller }) func startFundSession(bankAccountId : Text, fundType : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start fund sessions");
    };

    switch (bankAccounts.get(bankAccountId)) {
      case (null) { Runtime.trap("Bank account not found") };
      case (?account) {
        if (account.userId != caller) {
          Runtime.trap("Unauthorized: Can only start sessions for your own bank accounts");
        };
      };
    };

    let id = nextSessionId.toText();
    nextSessionId += 1;

    let session : FundSessionData = {
      id;
      bankAccountId;
      fundType;
      isActive = true;
      startTime = Time.now();
      endTime = 0;
      transactions = [];
    };

    fundSessions.add(id, session);
    id;
  };

  public shared ({ caller }) func endFundSession(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can end fund sessions");
    };

    switch (fundSessions.get(sessionId)) {
      case (null) { Runtime.trap("Fund session not found") };
      case (?session) {
        switch (bankAccounts.get(session.bankAccountId)) {
          case (null) { Runtime.trap("Bank account not found") };
          case (?account) {
            if (account.userId != caller) {
              Runtime.trap("Unauthorized: Can only end your own fund sessions");
            };
          };
        };

        let updated : FundSessionData = {
          id = session.id;
          bankAccountId = session.bankAccountId;
          fundType = session.fundType;
          isActive = false;
          startTime = session.startTime;
          endTime = Time.now();
          transactions = session.transactions;
        };
        fundSessions.add(sessionId, updated);
      };
    };
  };

  public query ({ caller }) func getFundSessions() : async [FundSessionData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view fund sessions");
    };

    let userSessions = fundSessions.values().toArray().filter(
      func(session) {
        switch (bankAccounts.get(session.bankAccountId)) {
          case (null) { false };
          case (?account) { account.userId == caller };
        };
      }
    );
    userSessions;
  };

  public query ({ caller }) func getAllFundSessions() : async [FundSessionData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all fund sessions");
    };
    fundSessions.values().toArray();
  };
};
