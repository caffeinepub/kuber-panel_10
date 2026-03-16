import {
  Check,
  Code2,
  Copy,
  Gamepad2,
  Layers,
  Shuffle,
  TrendingUp,
  Vote,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../../../context/AppContext";
import { useActor } from "../../../hooks/useActor";

const fundOptions = [
  {
    key: "gaming",
    label: "Gaming Fund",
    Icon: Gamepad2,
    color: "oklch(0.6 0.2 280)",
  },
  {
    key: "stock",
    label: "Stock Fund",
    Icon: TrendingUp,
    color: "oklch(0.7 0.2 145)",
  },
  {
    key: "mix",
    label: "Mix Fund",
    Icon: Shuffle,
    color: "oklch(0.75 0.15 85)",
  },
  {
    key: "political",
    label: "Political Fund",
    Icon: Vote,
    color: "oklch(0.6 0.2 25)",
  },
  {
    key: "all",
    label: "All Funds",
    Icon: Layers,
    color: "oklch(0.7 0.15 300)",
  },
];

export default function GeneratedCode() {
  const { activationCodes, refresh } = useApp();
  const { actor } = useActor();
  const [generating, setGenerating] = useState<string | null>(null);
  const [newCodes, setNewCodes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async (fundType: string) => {
    if (!actor) return;
    setGenerating(fundType);
    try {
      const code = await actor.generateActivationCode(fundType);
      setNewCodes((p) => ({ ...p, [fundType]: code }));
      toast.success(`${fundType} activation code generated!`);
      refresh();
    } catch {
      toast.error("Failed to generate code");
    } finally {
      setGenerating(null);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Code copied!");
  };

  const unusedCodes = activationCodes.filter((c) => c.isActive);
  const _usedCodes = activationCodes.filter((c) => !c.isActive);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold gold-text">
        Generated Activation Codes
      </h2>

      {/* Generate buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fundOptions.map(({ key, label, Icon, color }) => (
          <div key={key} className="dark-card rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-sm font-semibold text-white">{label}</span>
            </div>

            {newCodes[key] && (
              <div
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{
                  background: "oklch(0.13 0 0)",
                  border: "1px solid oklch(0.75 0.15 85 / 20%)",
                }}
              >
                <code className="text-xs font-mono gold-text flex-1 truncate">
                  {newCodes[key]}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(newCodes[key])}
                  data-ocid={`generated_code.copy_${key}.button`}
                >
                  {copied === newCodes[key] ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleGenerate(key)}
              disabled={generating === key}
              data-ocid={`generated_code.generate_${key}.button`}
              className="w-full py-2 rounded-lg text-xs font-bold text-black gold-gradient disabled:opacity-50"
            >
              {generating === key ? "Generating..." : "Generate Code"}
            </button>
          </div>
        ))}
      </div>

      {/* Active codes */}
      <div className="dark-card rounded-xl overflow-hidden">
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}
        >
          <span className="text-sm font-bold gold-text">
            ACTIVE CODES ({unusedCodes.length})
          </span>
        </div>
        <table className="w-full" data-ocid="generated_code.table">
          <thead>
            <tr style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)" }}>
              {["Code", "Fund Type", "Created", "Status", "Copy"].map((h) => (
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
            {unusedCodes.length === 0 && (
              <tr data-ocid="generated_code.empty_state">
                <td colSpan={5} className="text-center py-8 text-gray-600">
                  No active codes
                </td>
              </tr>
            )}
            {unusedCodes.map((c, i) => (
              <tr
                key={c.code}
                data-ocid={`generated_code.item.${i + 1}`}
                className="table-row-hover"
                style={{ borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)" }}
              >
                <td className="px-4 py-3">
                  <code className="text-sm font-mono gold-text">{c.code}</code>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs uppercase text-white font-medium">
                    {c.fundType}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(Number(c.createdAt) / 1_000_000).toLocaleDateString(
                    "en-IN",
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold text-green-400"
                    style={{ background: "oklch(0.6 0.2 145 / 15%)" }}
                  >
                    UNUSED
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleCopy(c.code)}
                    data-ocid={`generated_code.copy.button.${i + 1}`}
                  >
                    {copied === c.code ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500 hover:text-white" />
                    )}
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
