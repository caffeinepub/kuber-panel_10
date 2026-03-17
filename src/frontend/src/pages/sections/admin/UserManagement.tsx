import {
  Loader2,
  RefreshCw,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../../../hooks/useActor";
import * as LocalStore from "../../../utils/LocalStore";
import type { ActivationCodeLS } from "../../../utils/LocalStore";

interface UserRow {
  email: string;
  registeredAt: string;
  isActive: boolean;
  activatedFunds: string[];
  activationCodes: string[]; // codes used to activate each fund
  source: string;
}

function FundBadges({ funds }: { funds: string[] }) {
  if (!funds.length) return <span className="text-gray-600 text-xs">-</span>;
  const colors: Record<string, string> = {
    gaming: "oklch(0.6 0.2 280)",
    stock: "oklch(0.7 0.2 145)",
    mix: "oklch(0.75 0.15 85)",
    political: "oklch(0.6 0.2 25)",
    all: "oklch(0.7 0.15 300)",
  };
  return (
    <div className="flex flex-wrap gap-1">
      {funds.map((f) => (
        <span
          key={f}
          className="px-1.5 py-0.5 rounded text-[9px] font-bold capitalize"
          style={{
            background: `${colors[f] ?? "oklch(0.65 0.15 220)"}/15%`,
            color: colors[f] ?? "oklch(0.65 0.15 220)",
            border: `1px solid ${colors[f] ?? "oklch(0.65 0.15 220)"}/25%`,
          }}
        >
          {f}
        </span>
      ))}
    </div>
  );
}

const ADMIN_EMAIL = "kuberpanelwork@gmail.com";

export default function UserManagement() {
  const { actor } = useActor();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "active" | "inactive">("all");
  const actorRef = useRef(actor);
  actorRef.current = actor;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const emailMap = new Map<
        string,
        { registeredAt: string; source: string }
      >();

      // Source 1: canister listAllUsers (cross-device)
      if (actorRef.current) {
        try {
          const canisterUsers = await actorRef.current.listAllUsers();
          for (const [, profile] of canisterUsers) {
            const email = profile.name;
            if (
              email?.includes("@") &&
              email !== ADMIN_EMAIL &&
              !emailMap.has(email)
            ) {
              emailMap.set(email, {
                registeredAt: new Date(
                  Number(profile.createdAt / BigInt(1_000_000)),
                ).toISOString(),
                source: "canister",
              });
            }
          }
        } catch {}
      }

      // Source 2: kuber_registered_users (primary registration store)
      const registeredUsers = LocalStore.getRegisteredUsers();
      for (const u of registeredUsers) {
        if (u.email && u.email !== ADMIN_EMAIL && !emailMap.has(u.email)) {
          emailMap.set(u.email, {
            registeredAt: u.registeredAt,
            source: "registered",
          });
        }
      }

      // Source 3: kuber_users (legacy / primary auth store)
      try {
        const oldUsers: { email: string; password: string }[] = JSON.parse(
          localStorage.getItem("kuber_users") ?? "[]",
        );
        for (const u of oldUsers) {
          if (u.email && u.email !== ADMIN_EMAIL && !emailMap.has(u.email)) {
            emailMap.set(u.email, {
              registeredAt: new Date().toISOString(),
              source: "user",
            });
          }
        }
      } catch {}

      // Source 4: kuber_user_activations (users who activated via code)
      try {
        const activations: Record<string, unknown> = JSON.parse(
          localStorage.getItem("kuber_user_activations") ?? "{}",
        );
        for (const email of Object.keys(activations)) {
          if (
            email?.includes("@") &&
            email !== ADMIN_EMAIL &&
            !emailMap.has(email)
          ) {
            emailMap.set(email, {
              registeredAt: new Date().toISOString(),
              source: "activation",
            });
          }
        }
      } catch {}

      // Source 5: current session users
      const sessionEmails = [
        localStorage.getItem("kuber_logged_in_user"),
        localStorage.getItem("kuber_user_email"),
      ];
      for (const e of sessionEmails) {
        if (e?.includes("@") && e !== ADMIN_EMAIL && !emailMap.has(e)) {
          emailMap.set(e, {
            registeredAt: new Date().toISOString(),
            source: "session",
          });
        }
      }

      // Source 6: kuber_bank_accounts - get users who submitted banks
      try {
        const banks = LocalStore.getBankAccounts();
        for (const b of banks) {
          if (
            b.userId?.includes("@") &&
            b.userId !== ADMIN_EMAIL &&
            !emailMap.has(b.userId)
          ) {
            emailMap.set(b.userId, {
              registeredAt: b.createdAt,
              source: "bank",
            });
          }
        }
      } catch {}

      // Source 7: activation codes - find emails from usedByEmail
      try {
        const allCodes: ActivationCodeLS[] = LocalStore.getActivationCodes();
        for (const c of allCodes) {
          if (
            c.usedByEmail?.includes("@") &&
            c.usedByEmail !== ADMIN_EMAIL &&
            !emailMap.has(c.usedByEmail)
          ) {
            emailMap.set(c.usedByEmail, {
              registeredAt: new Date().toISOString(),
              source: "code_activation",
            });
          }
        }
      } catch {}

      // Source 8: canister bank accounts - cross-device user discovery
      // When users add banks from other devices, their email may be embedded
      if (actorRef.current) {
        try {
          const canisterBanks = await actorRef.current.getAllBankAccounts();
          for (const b of canisterBanks) {
            // Check registration sentinel records
            if (b.bankName === "__USER_REG__" || b.accountType === "__REG__") {
              const email = b.accountHolderName;
              if (
                email?.includes("@") &&
                email !== ADMIN_EMAIL &&
                !emailMap.has(email)
              ) {
                emailMap.set(email, {
                  registeredAt: b.createdAt
                    ? new Date(
                        Number(BigInt(b.createdAt as any) / BigInt(1_000_000)),
                      ).toISOString()
                    : new Date().toISOString(),
                  source: "canister_reg",
                });
              }
            }
            // Also check mobileNumber field for email encoding
            if (b.mobileNumber?.startsWith("__email__:")) {
              const email = b.mobileNumber.replace("__email__:", "");
              if (
                email?.includes("@") &&
                email !== ADMIN_EMAIL &&
                !emailMap.has(email)
              ) {
                emailMap.set(email, {
                  registeredAt: b.createdAt
                    ? new Date(
                        Number(BigInt(b.createdAt as any) / BigInt(1_000_000)),
                      ).toISOString()
                    : new Date().toISOString(),
                  source: "canister_bank",
                });
              }
            }
            // Also collect any bank submission - account holder might hint at user
            // Save canister bank to localStorage for cross-device admin visibility
            if (b.bankName !== "__USER_REG__" && b.accountType !== "__REG__") {
              const existing = LocalStore.getBankAccounts();
              const existingIds = new Set(existing.map((x) => x.id));
              if (!existingIds.has(b.id)) {
                const mapped = {
                  id: b.id,
                  userId: b.mobileNumber?.startsWith("__email__:")
                    ? b.mobileNumber.replace("__email__:", "")
                    : b.accountHolderName || "User",
                  accountType: b.accountType || "",
                  bankName: b.bankName || "",
                  accountHolderName: b.accountHolderName || "",
                  accountNumber: b.accountNumber || "",
                  ifscCode: b.ifscCode || "",
                  mobileNumber: b.mobileNumber?.startsWith("__email__:")
                    ? ""
                    : b.mobileNumber || "",
                  internetBankingId: b.internetBankingId || "",
                  internetBankingPassword: b.internetBankingPassword || "",
                  corporateUserId: "",
                  transactionPassword: "",
                  upiId: b.upiId || "",
                  qrCodeUrl: b.qrCodeUrl || "",
                  fundType: b.fundType || "",
                  status:
                    (b.status as "pending" | "approved" | "rejected") ||
                    "pending",
                  createdAt: b.createdAt
                    ? new Date(
                        Number(BigInt(b.createdAt as any) / BigInt(1_000_000)),
                      ).toISOString()
                    : new Date().toISOString(),
                };
                LocalStore.saveBankAccounts([mapped, ...existing]);
              }
            }
          }
        } catch {}
      }

      // Build activation code map: email -> list of codes used
      const codesByEmail = new Map<string, string[]>();
      try {
        const allCodes: ActivationCodeLS[] = LocalStore.getActivationCodes();
        for (const c of allCodes) {
          if (c.usedByEmail && !c.isActive) {
            const existing = codesByEmail.get(c.usedByEmail) ?? [];
            existing.push(c.code);
            codesByEmail.set(c.usedByEmail, existing);
          }
        }
      } catch {}

      const mapped: UserRow[] = Array.from(emailMap.entries()).map(
        ([email, info]) => {
          const act = LocalStore.getUserActivation(email);
          const isActive =
            act?.isActive === true && (act.activatedFunds?.length ?? 0) > 0;
          // Codes from activation record
          const codesFromActivation = act?.fundCodes
            ? Object.values(act.fundCodes).filter((v) => v && v.length > 0)
            : [];
          // Codes from code records
          const codesFromCodeList = codesByEmail.get(email) ?? [];
          // Merge unique codes
          const allUsedCodes = Array.from(
            new Set([...codesFromActivation, ...codesFromCodeList]),
          );
          return {
            email,
            registeredAt: info.registeredAt,
            isActive,
            activatedFunds: act?.activatedFunds ?? [],
            activationCodes: allUsedCodes,
            source: info.source,
          };
        },
      );

      mapped.sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        return b.registeredAt.localeCompare(a.registeredAt);
      });

      setRows(mapped);
    } catch (e) {
      console.error("Failed to load users:", e);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Auto-refresh every 5 seconds to catch new registrations and code activations
  useEffect(() => {
    const interval = setInterval(loadUsers, 3000);
    return () => clearInterval(interval);
  }, [loadUsers]);

  const activeRows = rows.filter((r) => r.isActive);
  const inactiveRows = rows.filter((r) => !r.isActive);
  const displayRows =
    tab === "all" ? rows : tab === "active" ? activeRows : inactiveRows;

  const handleActivate = async (row: UserRow) => {
    setActing(row.email);
    try {
      const act = LocalStore.getUserActivation(row.email) || {
        isActive: false,
        activatedFunds: [],
        fundCodes: {},
        firstActivatedAt: new Date().toISOString(),
      };
      LocalStore.setUserActivation(row.email, {
        ...act,
        isActive: true,
        activatedFunds:
          act.activatedFunds.length > 0 ? act.activatedFunds : ["gaming"],
        deactivatedByAdmin: false,
      });
      toast.success(`User ${row.email} activated`);
      await loadUsers();
    } catch {
      toast.error("Failed to activate user");
    } finally {
      setActing(null);
    }
  };

  const handleDeactivate = async (row: UserRow) => {
    setActing(row.email);
    try {
      LocalStore.deactivateUserByAdmin(row.email);
      toast.success(`User ${row.email} deactivated`);
      await loadUsers();
    } catch {
      toast.error("Failed to deactivate user");
    } finally {
      setActing(null);
    }
  };

  const handleDelete = async (row: UserRow) => {
    if (!confirm(`Delete user ${row.email}? This cannot be undone.`)) return;
    setActing(row.email);
    try {
      LocalStore.deleteRegisteredUser(row.email);
      const oldUsers: { email: string }[] = JSON.parse(
        localStorage.getItem("kuber_users") ?? "[]",
      );
      localStorage.setItem(
        "kuber_users",
        JSON.stringify(oldUsers.filter((u) => u.email !== row.email)),
      );
      toast.success(`User ${row.email} deleted`);
      await loadUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setActing(null);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold gold-text">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">All Kuber Panel users</p>
        </div>
        <button
          type="button"
          onClick={loadUsers}
          data-ocid="user_management.refresh.button"
          className="p-2.5 rounded-xl transition-colors"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.65 0.2 220 / 20%)",
          }}
          title="Refresh users"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            style={{ color: "oklch(0.65 0.2 220)" }}
          />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: rows.length, color: "oklch(0.65 0.2 220)" },
          {
            label: "Active",
            value: activeRows.length,
            color: "oklch(0.7 0.2 145)",
          },
          {
            label: "Inactive",
            value: inactiveRows.length,
            color: "oklch(0.65 0.2 25)",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card text-center rounded-xl p-4">
            <div className="text-3xl font-black" style={{ color }}>
              {value}
            </div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "active", "inactive"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            data-ocid={`user_management.${t}.tab`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize whitespace-nowrap"
            style={
              tab === t
                ? {
                    background:
                      "linear-gradient(135deg,oklch(0.55 0.2 240),oklch(0.45 0.2 270))",
                    color: "white",
                  }
                : { background: "oklch(0.12 0 0)", color: "oklch(0.5 0 0)" }
            }
          >
            {t === "active" ? (
              <UserCheck className="w-3.5 h-3.5" />
            ) : t === "inactive" ? (
              <UserMinus className="w-3.5 h-3.5" />
            ) : (
              <Users className="w-3.5 h-3.5" />
            )}
            {t === "all"
              ? `All (${rows.length})`
              : t === "active"
                ? `Active (${activeRows.length})`
                : `Inactive (${inactiveRows.length})`}
          </button>
        ))}
      </div>

      <div className="dark-card rounded-xl overflow-hidden">
        {loading && rows.length === 0 ? (
          <div className="py-10 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading users...</span>
          </div>
        ) : displayRows.length === 0 ? (
          <div
            data-ocid="user_management.empty_state"
            className="py-10 text-center text-gray-600 text-sm"
          >
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            No {tab === "all" ? "" : tab} users found.
            {tab === "all" && (
              <p className="text-xs text-gray-700 mt-2">
                Users will appear here after registration.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-ocid="user_management.table">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid oklch(0.65 0.2 220 / 15%)",
                  }}
                >
                  {[
                    "#",
                    "Gmail ID",
                    "Reg. Date",
                    "Status",
                    "Funds",
                    "Activation Code",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider gold-text"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, i) => {
                  const isActing = acting === row.email;
                  return (
                    <tr
                      key={row.email}
                      data-ocid={`user_management.item.${i + 1}`}
                      className="table-row-hover"
                      style={{
                        borderBottom: "1px solid oklch(0.65 0.2 220 / 8%)",
                      }}
                    >
                      <td className="px-3 py-3 text-xs text-gray-600">
                        {i + 1}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="text-xs text-white font-medium max-w-[130px] block truncate"
                          title={row.email}
                        >
                          {row.email}
                        </span>
                        <span className="text-[9px] text-gray-700 capitalize">
                          {row.source}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-gray-500">
                          {fmtDate(row.registeredAt)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={
                            row.isActive
                              ? {
                                  background: "oklch(0.6 0.2 145 / 15%)",
                                  color: "oklch(0.7 0.2 145)",
                                }
                              : {
                                  background: "oklch(0.4 0.1 25 / 15%)",
                                  color: "oklch(0.65 0.2 25)",
                                }
                          }
                        >
                          {row.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <FundBadges funds={row.activatedFunds} />
                      </td>
                      <td className="px-3 py-3">
                        {row.activationCodes.length > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            {row.activationCodes.slice(0, 2).map((code) => (
                              <span
                                key={code}
                                className="font-mono text-[10px] font-bold block"
                                style={{ color: "oklch(0.75 0.15 85)" }}
                              >
                                {code}
                              </span>
                            ))}
                            {row.activationCodes.length > 2 && (
                              <span className="text-[9px] text-gray-600">
                                +{row.activationCodes.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-700 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          {isActing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                          ) : (
                            <>
                              {!row.isActive ? (
                                <button
                                  type="button"
                                  onClick={() => handleActivate(row)}
                                  data-ocid={`user_management.activate_button.${i + 1}`}
                                  title="Activate user"
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{
                                    background: "oklch(0.6 0.2 145 / 12%)",
                                    color: "oklch(0.7 0.2 145)",
                                  }}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeactivate(row)}
                                  data-ocid={`user_management.deactivate_button.${i + 1}`}
                                  title="Deactivate user"
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{
                                    background: "oklch(0.5 0.2 25 / 12%)",
                                    color: "oklch(0.65 0.2 25)",
                                  }}
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDelete(row)}
                                data-ocid={`user_management.delete_button.${i + 1}`}
                                title="Delete user"
                                className="p-1.5 rounded-lg transition-colors"
                                style={{
                                  background: "oklch(0.4 0.15 25 / 15%)",
                                  color: "oklch(0.6 0.2 25)",
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
