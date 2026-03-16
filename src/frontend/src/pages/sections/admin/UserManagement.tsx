import { Loader2, Trash2, UserCheck, UserMinus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as LocalStore from "../../../utils/LocalStore";

interface UserRow {
  principal: string;
  email: string;
  registeredAt: string;
  isActive: boolean;
  activatedFunds: string[];
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

export default function UserManagement() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "inactive">("active");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Load from both localStorage keys
      const registeredUsers = LocalStore.getRegisteredUsers();
      const oldUsers: { email: string; password: string }[] = JSON.parse(
        localStorage.getItem("kuber_users") ?? "[]",
      );

      // Merge deduped by email
      const emailSet = new Set<string>();
      const allUsers: { email: string; registeredAt: string }[] = [];
      for (const u of registeredUsers) {
        if (!emailSet.has(u.email)) {
          emailSet.add(u.email);
          allUsers.push({ email: u.email, registeredAt: u.registeredAt });
        }
      }
      for (const u of oldUsers) {
        if (!emailSet.has(u.email)) {
          emailSet.add(u.email);
          allUsers.push({
            email: u.email,
            registeredAt: new Date().toISOString(),
          });
        }
      }

      const mapped: UserRow[] = allUsers.map((u) => {
        const act = LocalStore.getUserActivation(u.email);
        return {
          principal: u.email,
          email: u.email,
          registeredAt: u.registeredAt,
          isActive:
            act?.isActive === true && (act.activatedFunds?.length ?? 0) > 0,
          activatedFunds: act?.activatedFunds ?? [],
        };
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

  const activeRows = rows.filter((r) => r.isActive);
  const inactiveRows = rows.filter((r) => !r.isActive);
  const displayRows = tab === "active" ? activeRows : inactiveRows;

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
      // Also delete from kuber_users
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
      <div>
        <h2 className="text-xl font-bold gold-text">User Management</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage registered users and activations
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: rows.length, color: "oklch(0.75 0.15 85)" },
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

      <div className="flex gap-2">
        {(["active", "inactive"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            data-ocid={`user_management.${t}.tab`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize"
            style={
              tab === t
                ? {
                    background:
                      "linear-gradient(135deg,oklch(0.82 0.17 85),oklch(0.67 0.13 85))",
                    color: "black",
                  }
                : { background: "oklch(0.12 0 0)", color: "oklch(0.5 0 0)" }
            }
          >
            {t === "active" ? (
              <UserCheck className="w-4 h-4" />
            ) : (
              <UserMinus className="w-4 h-4" />
            )}
            {t === "active" ? "Active Users" : "Inactive Users"}
            <span
              className="px-1.5 py-0.5 rounded-full text-xs"
              style={{
                background: "rgba(0,0,0,0.2)",
                color: tab === t ? "rgba(0,0,0,0.7)" : "oklch(0.5 0 0)",
              }}
            >
              {t === "active" ? activeRows.length : inactiveRows.length}
            </span>
          </button>
        ))}
      </div>

      <div className="dark-card rounded-xl overflow-hidden">
        {loading ? (
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
            No {tab} users
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-ocid="user_management.table">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)",
                  }}
                >
                  {[
                    "#",
                    "Gmail ID",
                    "Reg. Date",
                    "Status",
                    "Activated Funds",
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
                        borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)",
                      }}
                    >
                      <td className="px-3 py-3 text-xs text-gray-600">
                        {i + 1}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="text-xs text-white font-medium break-all max-w-[140px] block truncate"
                          title={row.email}
                        >
                          {row.email}
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
