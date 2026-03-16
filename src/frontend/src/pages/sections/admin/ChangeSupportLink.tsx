import { Link, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../../context/AppContext";
import { useActor } from "../../../hooks/useActor";

export default function ChangeSupportLink() {
  const { supportLink, refresh } = useApp();
  const { actor } = useActor();
  const [newLink, setNewLink] = useState(supportLink);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!actor) return;
    if (!newLink.trim()) {
      toast.error("Enter a valid link");
      return;
    }
    setLoading(true);
    try {
      await actor.updateSupportLink(newLink.trim());
      toast.success("Support link updated successfully");
      refresh();
    } catch {
      toast.error("Failed to update link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gold-text">Change Support Link</h2>

      <div className="max-w-lg dark-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Link className="w-5 h-5 gold-text" />
          <span className="text-sm font-semibold text-white">
            Telegram Support Link
          </span>
        </div>

        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
            Current Link
          </div>
          <div
            className="px-3 py-2.5 rounded-lg text-xs text-gray-400 truncate"
            style={{
              background: "oklch(0.08 0 0)",
              border: "1px solid oklch(0.75 0.15 85 / 10%)",
            }}
          >
            {supportLink}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
            New Telegram Link
          </div>
          <input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://t.me/..."
            data-ocid="change_support.input"
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
            style={{
              background: "oklch(0.13 0 0)",
              border: "1px solid oklch(0.75 0.15 85 / 20%)",
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          data-ocid="change_support.submit_button"
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-black gold-gradient disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Update Support Link"}
        </button>
      </div>
    </div>
  );
}
