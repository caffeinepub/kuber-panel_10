import {
  Check,
  Code2,
  Copy,
  Gamepad2,
  Layers,
  Loader2,
  Shuffle,
  TrendingUp,
  Vote,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as LocalStore from "../../../utils/LocalStore";
import type { ActivationCodeLS } from "../../../utils/LocalStore";
import { generateSelfValidatingCode } from "../../../utils/SelfValidatingCode";

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
  const [codes, setCodes] = useState<ActivationCodeLS[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [latestCode, setLatestCode] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const loadCodes = useCallback(() => {
    setCodes(LocalStore.getActivationCodes());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const handleGenerate = async (fundType: string) => {
    setGenerating(fundType);
    try {
      // Generate a self-validating code for cross-device use
      const svCode = generateSelfValidatingCode(fundType);
      // Save to localStorage
      const allCodes = LocalStore.getActivationCodes();
      const entry: ActivationCodeLS = {
        code: svCode,
        fundType,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      allCodes.unshift(entry);
      LocalStore.saveActivationCodes(allCodes);
      setLatestCode((p) => ({ ...p, [fundType]: svCode }));
      toast.success(`Code generated: ${svCode}`);
      loadCodes();
    } catch {
      toast.error("Failed to generate code");
    } finally {
      setGenerating(null);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    toast.success("Code copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const fmtDate = (createdAt: string) =>
    new Date(createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold gold-text">Generated Codes</h2>
        <p className="text-sm text-gray-500 mt-1">
          Generate one-time activation codes for users
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {fundOptions.map(({ key, label, Icon, color }) => (
          <div
            key={key}
            data-ocid={`generated_code.${key}.panel`}
            className="dark-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">
                    {label}
                  </div>
                  {latestCode[key] && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color }}
                      >
                        {latestCode[key]}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(latestCode[key])}
                        className="text-gray-500 hover:text-white"
                        data-ocid={`generated_code.${key}.copy_button`}
                      >
                        {copied === latestCode[key] ? (
                          <Check
                            className="w-3 h-3"
                            style={{ color: "oklch(0.7 0.2 145)" }}
                          />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleGenerate(key)}
                disabled={generating === key}
                data-ocid={`generated_code.${key}.primary_button`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-black gold-gradient disabled:opacity-60 flex-shrink-0"
              >
                {generating === key ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Code2 className="w-3.5 h-3.5" />
                )}
                {generating === key ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          All Codes ({codes.length})
        </h3>
        <div className="dark-card rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-10 flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading codes...</span>
            </div>
          ) : codes.length === 0 ? (
            <div
              data-ocid="generated_code.empty_state"
              className="py-10 text-center text-gray-600 text-sm"
            >
              No codes generated yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-ocid="generated_code.table">
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid oklch(0.75 0.15 85 / 15%)",
                    }}
                  >
                    {["Code", "Fund", "Created", "Status", "Copy"].map((h) => (
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
                  {codes.map((c, i) => (
                    <tr
                      key={c.code}
                      data-ocid={`generated_code.item.${i + 1}`}
                      style={{
                        borderBottom: "1px solid oklch(0.75 0.15 85 / 8%)",
                      }}
                    >
                      <td className="px-3 py-3">
                        <span className="font-mono text-xs font-bold text-white">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="text-xs capitalize"
                          style={{ color: "oklch(0.75 0.15 220)" }}
                        >
                          {c.fundType}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-gray-500">
                          {fmtDate(c.createdAt)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={
                            c.isActive
                              ? {
                                  background: "oklch(0.6 0.2 145 / 15%)",
                                  color: "oklch(0.7 0.2 145)",
                                }
                              : {
                                  background: "oklch(0.4 0.1 25 / 15%)",
                                  color: "oklch(0.6 0.15 25)",
                                }
                          }
                        >
                          {c.isActive ? "UNUSED" : "USED"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {c.isActive && (
                          <button
                            type="button"
                            onClick={() => handleCopy(c.code)}
                            className="text-gray-500 hover:text-white"
                            data-ocid={`generated_code.copy_button.${i + 1}`}
                          >
                            {copied === c.code ? (
                              <Check
                                className="w-3.5 h-3.5"
                                style={{ color: "oklch(0.7 0.2 145)" }}
                              />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
