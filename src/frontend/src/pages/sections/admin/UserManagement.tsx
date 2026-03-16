import { Trash2 } from "lucide-react";
import { useState } from "react";
import { getRegisteredUsers } from "../../LoginPage";

export default function UserManagement() {
  const [users, setUsers] = useState(() => getRegisteredUsers());

  const handleDelete = (email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;
    const updated = users.filter((u) => u.email !== email);
    localStorage.setItem("kuber_registered_users", JSON.stringify(updated));
    setUsers(updated);
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gold-text">User Management</h2>

      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Total Users",
            value: users.length,
            color: "oklch(0.75 0.15 85)",
          },
          {
            label: "Registered",
            value: users.length,
            color: "oklch(0.7 0.2 145)",
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

      <div className="dark-card rounded-xl overflow-hidden">
        <table className="w-full" data-ocid="user_management.table">
          <thead>
            <tr style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}>
              {["#", "Gmail ID", "Registered On", "Action"].map((h) => (
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
            {users.length === 0 && (
              <tr data-ocid="user_management.empty_state">
                <td
                  colSpan={4}
                  className="text-center py-10 text-gray-600 text-sm"
                >
                  No registered users yet
                </td>
              </tr>
            )}
            {users.map((user, i) => (
              <tr
                key={user.email}
                data-ocid={`user_management.item.${i + 1}`}
                className="table-row-hover"
                style={{
                  borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)",
                }}
              >
                <td className="px-4 py-3 text-xs text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {fmtDate(user.registeredAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(user.email)}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
