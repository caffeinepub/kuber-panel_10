import type { Principal } from "@icp-sdk/core/principal";
import { Trash2, UserCheck, UserX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../../../backend";
import { useActor } from "../../../hooks/useActor";

type UserFilter = "all" | "active" | "inactive";

export default function UserManagement() {
  const { actor } = useActor();
  const [users, setUsers] = useState<[Principal, UserProfile][]>([]);
  const [filter, setFilter] = useState<UserFilter>("all");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const list = await actor.listAllUsers();
      setUsers(list);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAction = async (
    principal: Principal,
    action: "activate" | "deactivate" | "delete",
  ) => {
    if (!actor) return;
    if (action === "delete" && !confirm("Delete this user permanently?"))
      return;
    const pStr = principal.toString();
    setActing(pStr);
    try {
      if (action === "activate") await actor.activateUser(principal);
      else if (action === "deactivate") await actor.deactivateUser(principal);
      else await actor.deleteUser(principal);
      toast.success(`User ${action}d successfully`);
      loadUsers();
    } catch {
      toast.error(`Failed to ${action} user`);
    } finally {
      setActing(null);
    }
  };

  const filtered = users.filter(([, p]) =>
    filter === "all"
      ? true
      : filter === "active"
        ? p.status === "active"
        : p.status === "inactive",
  );

  const fmtDate = (n: bigint) =>
    new Date(Number(n) / 1_000_000).toLocaleDateString("en-IN");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gold-text">User Management</h2>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Users",
            value: users.length,
            color: "oklch(0.75 0.15 85)",
          },
          {
            label: "Active",
            value: users.filter(([, p]) => p.status === "active").length,
            color: "oklch(0.7 0.2 145)",
          },
          {
            label: "Inactive",
            value: users.filter(([, p]) => p.status === "inactive").length,
            color: "oklch(0.65 0.2 25)",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card text-center">
            <div className="text-3xl font-black" style={{ color }}>
              {value}
            </div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div
        className="flex rounded-lg p-1 w-fit"
        style={{ background: "oklch(0.08 0 0)" }}
      >
        {(["all", "active", "inactive"] as UserFilter[]).map((f) => (
          <button
            type="button"
            key={f}
            onClick={() => setFilter(f)}
            data-ocid={`user_management.${f}.tab`}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all capitalize ${
              filter === f
                ? "gold-gradient text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="dark-card rounded-xl overflow-hidden">
        <table className="w-full" data-ocid="user_management.table">
          <thead>
            <tr style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}>
              {[
                "Gmail ID",
                "Registered",
                "Status",
                "Activated Funds",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider gold-text"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-600">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr data-ocid="user_management.empty_state">
                <td colSpan={5} className="text-center py-10 text-gray-600">
                  No users found
                </td>
              </tr>
            )}
            {filtered.map(([principal, profile], i) => {
              const pStr = principal.toString();
              const activeFunds =
                Object.entries(profile.fundStatus || {})
                  .filter(([, v]) => (v as Record<string, unknown>)?.isActive)
                  .map(([k]) => k.replace("Status", ""))
                  .join(", ") || "None";
              return (
                <tr
                  key={pStr}
                  data-ocid={`user_management.item.${i + 1}`}
                  className="table-row-hover"
                  style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)" }}
                >
                  <td className="px-4 py-3 text-sm text-white">
                    {profile.name || `${pStr.slice(0, 20)}...`}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {fmtDate(profile.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        profile.status === "active"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                      style={{
                        background:
                          profile.status === "active"
                            ? "oklch(0.6 0.2 145 / 15%)"
                            : "oklch(0.6 0.2 25 / 15%)",
                      }}
                    >
                      {profile.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 capitalize">
                    {activeFunds}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {profile.status !== "active" && (
                        <button
                          type="button"
                          onClick={() => handleAction(principal, "activate")}
                          disabled={acting === pStr}
                          data-ocid={`user_management.activate.button.${i + 1}`}
                          className="p-1.5 rounded-lg"
                          style={{ background: "oklch(0.6 0.2 145 / 15%)" }}
                          title="Activate"
                        >
                          <UserCheck
                            className="w-3.5 h-3.5"
                            style={{ color: "oklch(0.7 0.2 145)" }}
                          />
                        </button>
                      )}
                      {profile.status === "active" && (
                        <button
                          type="button"
                          onClick={() => handleAction(principal, "deactivate")}
                          disabled={acting === pStr}
                          data-ocid={`user_management.deactivate.button.${i + 1}`}
                          className="p-1.5 rounded-lg"
                          style={{ background: "oklch(0.75 0.15 85 / 15%)" }}
                          title="Deactivate"
                        >
                          <UserX className="w-3.5 h-3.5 gold-text" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAction(principal, "delete")}
                        disabled={acting === pStr}
                        data-ocid={`user_management.delete_button.${i + 1}`}
                        className="p-1.5 rounded-lg"
                        style={{ background: "oklch(0.6 0.2 25 / 15%)" }}
                        title="Delete"
                      >
                        <Trash2
                          className="w-3.5 h-3.5"
                          style={{ color: "oklch(0.65 0.2 25)" }}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
