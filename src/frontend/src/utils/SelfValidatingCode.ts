// Self-validating activation codes that work across any device without server sync
// Format: KP[FUNDPREFIX]-[6RANDOM]-[3HASH]
// Fund prefixes: G=gaming, S=stock, M=mix, P=political, A=all

const SECRET = "KPANEL2026KUBER";
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const FUND_TO_PREFIX: Record<string, string> = {
  gaming: "G",
  stock: "S",
  mix: "M",
  political: "P",
  all: "A",
};

const PREFIX_TO_FUND: Record<string, string> = {
  G: "gaming",
  S: "stock",
  M: "mix",
  P: "political",
  A: "all",
};

function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(4, "0").slice(0, 4);
}

export function generateSelfValidatingCode(fundType: string): string {
  const prefix = FUND_TO_PREFIX[fundType] || "G";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  const hash = djb2Hash(prefix + random + SECRET);
  return `KP${prefix}-${random}-${hash}`;
}

export function validateSelfValidatingCode(code: string): {
  valid: boolean;
  fundType?: string;
} {
  const trimmed = code.trim().toUpperCase();
  // Format: KP[G|S|M|P|A]-[6 alphanum]-[4 alphanum]
  const match = trimmed.match(/^KP([GSMPA])-([A-Z0-9]{6})-([A-Z0-9]{4})$/);
  if (!match) return { valid: false };
  const [, prefixChar, random, checkHash] = match;
  const expected = djb2Hash(prefixChar + random + SECRET);
  if (checkHash !== expected) return { valid: false };
  return { valid: true, fundType: PREFIX_TO_FUND[prefixChar] };
}

// Track used self-validating codes in localStorage to prevent same-device reuse
function getUsedSVCodes(): Set<string> {
  try {
    const raw = localStorage.getItem("kuber_used_sv_codes") ?? "[]";
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function markSVCodeUsed(code: string): void {
  const used = getUsedSVCodes();
  used.add(code.trim().toUpperCase());
  // Keep last 500
  const arr = Array.from(used).slice(-500);
  localStorage.setItem("kuber_used_sv_codes", JSON.stringify(arr));
}

export function redeemSelfValidatingCode(code: string): {
  success: boolean;
  fundType?: string;
} {
  const trimmed = code.trim().toUpperCase();
  const used = getUsedSVCodes();
  if (used.has(trimmed)) return { success: false };
  const result = validateSelfValidatingCode(trimmed);
  if (!result.valid) return { success: false };
  markSVCodeUsed(trimmed);
  return { success: true, fundType: result.fundType };
}

export function isSelfValidatingCode(code: string): boolean {
  return /^KP[GSMPA]-[A-Z0-9]{6}-[A-Z0-9]{4}$/.test(code.trim().toUpperCase());
}
