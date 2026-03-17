import { useState } from "react";

interface BankTheme {
  bg: string;
  accent: string;
  abbr: string;
  domain: string;
}

const BANK_THEMES: Record<string, BankTheme> = {
  // === PUBLIC SECTOR BANKS ===
  "state bank of india": {
    bg: "#002B8F",
    accent: "#fff",
    abbr: "SBI",
    domain: "sbi.co.in",
  },
  "state bank": {
    bg: "#002B8F",
    accent: "#fff",
    abbr: "SBI",
    domain: "sbi.co.in",
  },
  sbi: { bg: "#002B8F", accent: "#fff", abbr: "SBI", domain: "sbi.co.in" },
  "bank of baroda": {
    bg: "#FF6600",
    accent: "#fff",
    abbr: "BOB",
    domain: "bankofbaroda.in",
  },
  bob: {
    bg: "#FF6600",
    accent: "#fff",
    abbr: "BOB",
    domain: "bankofbaroda.in",
  },
  "union bank of india": {
    bg: "#2B2D8E",
    accent: "#fff",
    abbr: "UBI",
    domain: "unionbankofindia.co.in",
  },
  "union bank": {
    bg: "#2B2D8E",
    accent: "#fff",
    abbr: "UBI",
    domain: "unionbankofindia.co.in",
  },
  "punjab national bank": {
    bg: "#1B3E8E",
    accent: "#FFD700",
    abbr: "PNB",
    domain: "pnbindia.in",
  },
  pnb: { bg: "#1B3E8E", accent: "#FFD700", abbr: "PNB", domain: "pnbindia.in" },
  "canara bank": {
    bg: "#1A3A8F",
    accent: "#FFD700",
    abbr: "CNB",
    domain: "canarabank.com",
  },
  canara: {
    bg: "#1A3A8F",
    accent: "#FFD700",
    abbr: "CNB",
    domain: "canarabank.com",
  },
  "bank of india": {
    bg: "#013380",
    accent: "#FFD700",
    abbr: "BOI",
    domain: "bankofindia.co.in",
  },
  boi: {
    bg: "#013380",
    accent: "#FFD700",
    abbr: "BOI",
    domain: "bankofindia.co.in",
  },
  "indian bank": {
    bg: "#0C5C9A",
    accent: "#fff",
    abbr: "IB",
    domain: "indianbank.in",
  },
  "central bank of india": {
    bg: "#CC1111",
    accent: "#fff",
    abbr: "CBI",
    domain: "centralbankofindia.co.in",
  },
  "central bank": {
    bg: "#CC1111",
    accent: "#fff",
    abbr: "CBI",
    domain: "centralbankofindia.co.in",
  },
  "uco bank": {
    bg: "#00448C",
    accent: "#FFD700",
    abbr: "UCO",
    domain: "ucobank.com",
  },
  uco: { bg: "#00448C", accent: "#FFD700", abbr: "UCO", domain: "ucobank.com" },
  "bank of maharashtra": {
    bg: "#002975",
    accent: "#FFD700",
    abbr: "BOM",
    domain: "bankofmaharashtra.in",
  },
  "punjab and sind bank": {
    bg: "#003D7A",
    accent: "#FFD700",
    abbr: "PSB",
    domain: "psbindia.com",
  },
  "indian overseas bank": {
    bg: "#173F8C",
    accent: "#fff",
    abbr: "IOB",
    domain: "iob.in",
  },
  iob: { bg: "#173F8C", accent: "#fff", abbr: "IOB", domain: "iob.in" },
  // === PRIVATE SECTOR BANKS ===
  "hdfc bank": {
    bg: "#004C8C",
    accent: "#fff",
    abbr: "HDFC",
    domain: "hdfcbank.com",
  },
  hdfc: { bg: "#004C8C", accent: "#fff", abbr: "HDFC", domain: "hdfcbank.com" },
  "icici bank": {
    bg: "#A01010",
    accent: "#FFD700",
    abbr: "ICICI",
    domain: "icicibank.com",
  },
  icici: {
    bg: "#A01010",
    accent: "#FFD700",
    abbr: "ICICI",
    domain: "icicibank.com",
  },
  "axis bank": {
    bg: "#800020",
    accent: "#fff",
    abbr: "AXIS",
    domain: "axisbank.com",
  },
  axis: { bg: "#800020", accent: "#fff", abbr: "AXIS", domain: "axisbank.com" },
  "kotak mahindra bank": {
    bg: "#D93010",
    accent: "#fff",
    abbr: "KMB",
    domain: "kotak.com",
  },
  "kotak mahindra": {
    bg: "#D93010",
    accent: "#fff",
    abbr: "KMB",
    domain: "kotak.com",
  },
  kotak: { bg: "#D93010", accent: "#fff", abbr: "KMB", domain: "kotak.com" },
  "yes bank": {
    bg: "#007DC6",
    accent: "#fff",
    abbr: "YES",
    domain: "yesbank.in",
  },
  yes: { bg: "#007DC6", accent: "#fff", abbr: "YES", domain: "yesbank.in" },
  "indusind bank": {
    bg: "#003F8A",
    accent: "#FFD700",
    abbr: "IIB",
    domain: "indusind.com",
  },
  indusind: {
    bg: "#003F8A",
    accent: "#FFD700",
    abbr: "IIB",
    domain: "indusind.com",
  },
  "federal bank": {
    bg: "#002B6E",
    accent: "#FFD700",
    abbr: "FBL",
    domain: "federalbank.co.in",
  },
  federal: {
    bg: "#002B6E",
    accent: "#FFD700",
    abbr: "FBL",
    domain: "federalbank.co.in",
  },
  "idbi bank": {
    bg: "#007BBD",
    accent: "#fff",
    abbr: "IDBI",
    domain: "idbibank.in",
  },
  idbi: { bg: "#007BBD", accent: "#fff", abbr: "IDBI", domain: "idbibank.in" },
  "idfc first bank": {
    bg: "#007D7B",
    accent: "#fff",
    abbr: "IDFC",
    domain: "idfcfirstbank.com",
  },
  "idfc first": {
    bg: "#007D7B",
    accent: "#fff",
    abbr: "IDFC",
    domain: "idfcfirstbank.com",
  },
  idfc: {
    bg: "#007D7B",
    accent: "#fff",
    abbr: "IDFC",
    domain: "idfcfirstbank.com",
  },
  "rbl bank": {
    bg: "#002F8F",
    accent: "#FFD700",
    abbr: "RBL",
    domain: "rblbank.com",
  },
  rbl: { bg: "#002F8F", accent: "#FFD700", abbr: "RBL", domain: "rblbank.com" },
  "dcb bank": {
    bg: "#006130",
    accent: "#fff",
    abbr: "DCB",
    domain: "dcbbank.com",
  },
  dcb: { bg: "#006130", accent: "#fff", abbr: "DCB", domain: "dcbbank.com" },
  "karur vysya bank": {
    bg: "#AA0A22",
    accent: "#fff",
    abbr: "KVB",
    domain: "kvb.co.in",
  },
  kvb: { bg: "#AA0A22", accent: "#fff", abbr: "KVB", domain: "kvb.co.in" },
  "karnataka bank": {
    bg: "#BB0000",
    accent: "#fff",
    abbr: "KBL",
    domain: "ktkbank.com",
  },
  karnataka: {
    bg: "#BB0000",
    accent: "#fff",
    abbr: "KBL",
    domain: "ktkbank.com",
  },
  "south indian bank": {
    bg: "#003080",
    accent: "#FFD700",
    abbr: "SIB",
    domain: "southindianbank.com",
  },
  "south indian": {
    bg: "#003080",
    accent: "#FFD700",
    abbr: "SIB",
    domain: "southindianbank.com",
  },
  "city union bank": {
    bg: "#002D80",
    accent: "#FFD700",
    abbr: "CUB",
    domain: "cityunionbank.com",
  },
  "bandhan bank": {
    bg: "#C00025",
    accent: "#fff",
    abbr: "BDB",
    domain: "bandhanbank.com",
  },
  bandhan: {
    bg: "#C00025",
    accent: "#fff",
    abbr: "BDB",
    domain: "bandhanbank.com",
  },
  "saraswat bank": {
    bg: "#003D78",
    accent: "#FFD700",
    abbr: "SBL",
    domain: "saraswatbank.com",
  },
  saraswat: {
    bg: "#003D78",
    accent: "#FFD700",
    abbr: "SBL",
    domain: "saraswatbank.com",
  },
  "jammu kashmir bank": {
    bg: "#002D70",
    accent: "#FFD700",
    abbr: "JKB",
    domain: "jkbank.com",
  },
  "j&k bank": {
    bg: "#002D70",
    accent: "#FFD700",
    abbr: "JKB",
    domain: "jkbank.com",
  },
  jkb: { bg: "#002D70", accent: "#FFD700", abbr: "JKB", domain: "jkbank.com" },
  "tamilnad mercantile bank": {
    bg: "#002D80",
    accent: "#FFD700",
    abbr: "TMB",
    domain: "tmbank.in",
  },
  // === SMALL FINANCE BANKS ===
  "au small finance bank": {
    bg: "#C8001A",
    accent: "#fff",
    abbr: "AUSF",
    domain: "aubank.in",
  },
  "au bank": {
    bg: "#C8001A",
    accent: "#fff",
    abbr: "AUSF",
    domain: "aubank.in",
  },
  "au small finance": {
    bg: "#C8001A",
    accent: "#fff",
    abbr: "AUSF",
    domain: "aubank.in",
  },
  equitas: {
    bg: "#E84000",
    accent: "#fff",
    abbr: "EQL",
    domain: "equitasbank.com",
  },
  "equitas small finance bank": {
    bg: "#E84000",
    accent: "#fff",
    abbr: "EQL",
    domain: "equitasbank.com",
  },
  ujjivan: {
    bg: "#C83000",
    accent: "#fff",
    abbr: "UJJ",
    domain: "ujjivansfb.in",
  },
  "ujjivan small finance bank": {
    bg: "#C83000",
    accent: "#fff",
    abbr: "UJJ",
    domain: "ujjivansfb.in",
  },
  esaf: {
    bg: "#002D80",
    accent: "#FFD700",
    abbr: "ESAF",
    domain: "esafbank.com",
  },
  suryoday: {
    bg: "#E04800",
    accent: "#fff",
    abbr: "SUR",
    domain: "suryodaybank.com",
  },
  jana: {
    bg: "#002880",
    accent: "#FFD700",
    abbr: "JANA",
    domain: "janabank.in",
  },
  "jana bank": {
    bg: "#002880",
    accent: "#FFD700",
    abbr: "JANA",
    domain: "janabank.in",
  },
  fincare: {
    bg: "#CC0020",
    accent: "#fff",
    abbr: "FIN",
    domain: "fincarebank.com",
  },
  utkarsh: {
    bg: "#E05500",
    accent: "#fff",
    abbr: "UKR",
    domain: "utkarshbank.com",
  },
  // === PAYMENTS BANKS ===
  "paytm payments bank": {
    bg: "#00A0E0",
    accent: "#fff",
    abbr: "PTM",
    domain: "paytmbank.com",
  },
  "paytm bank": {
    bg: "#00A0E0",
    accent: "#fff",
    abbr: "PTM",
    domain: "paytmbank.com",
  },
  paytm: {
    bg: "#00A0E0",
    accent: "#fff",
    abbr: "PTM",
    domain: "paytmbank.com",
  },
  "airtel payments bank": {
    bg: "#CC0000",
    accent: "#fff",
    abbr: "AIR",
    domain: "airtel.in",
  },
  "airtel bank": {
    bg: "#CC0000",
    accent: "#fff",
    abbr: "AIR",
    domain: "airtel.in",
  },
  airtel: { bg: "#CC0000", accent: "#fff", abbr: "AIR", domain: "airtel.in" },
  "jio payments bank": {
    bg: "#003A80",
    accent: "#FFD700",
    abbr: "JIO",
    domain: "jiopayments.com",
  },
  "jio bank": {
    bg: "#003A80",
    accent: "#FFD700",
    abbr: "JIO",
    domain: "jiopayments.com",
  },
  jio: {
    bg: "#003A80",
    accent: "#FFD700",
    abbr: "JIO",
    domain: "jiopayments.com",
  },
  "india post payments bank": {
    bg: "#CC0000",
    accent: "#fff",
    abbr: "IPPB",
    domain: "ippbonline.com",
  },
  ippb: {
    bg: "#CC0000",
    accent: "#fff",
    abbr: "IPPB",
    domain: "ippbonline.com",
  },
  "fino payments bank": {
    bg: "#BB0015",
    accent: "#fff",
    abbr: "FNO",
    domain: "finobank.com",
  },
  fino: { bg: "#BB0015", accent: "#fff", abbr: "FNO", domain: "finobank.com" },
  // === FOREIGN BANKS ===
  citibank: {
    bg: "#003A80",
    accent: "#FFD700",
    abbr: "CITI",
    domain: "citibank.co.in",
  },
  hsbc: { bg: "#AA0000", accent: "#fff", abbr: "HSBC", domain: "hsbc.co.in" },
  "standard chartered": {
    bg: "#006E51",
    accent: "#fff",
    abbr: "SCB",
    domain: "sc.com",
  },
  barclays: {
    bg: "#00AEEE",
    accent: "#fff",
    abbr: "BARC",
    domain: "barclays.in",
  },
  "deutsche bank": {
    bg: "#003A80",
    accent: "#fff",
    abbr: "DB",
    domain: "db.com",
  },
  // === COOPERATIVE / OTHERS ===
  "allahabad bank": {
    bg: "#003270",
    accent: "#FFD700",
    abbr: "ALB",
    domain: "allahabadbank.in",
  },
  "oriental bank of commerce": {
    bg: "#002D78",
    accent: "#FFD700",
    abbr: "OBC",
    domain: "obcindia.co.in",
  },
  obc: {
    bg: "#002D78",
    accent: "#FFD700",
    abbr: "OBC",
    domain: "obcindia.co.in",
  },
};

function getTheme(bankName: string): BankTheme | null {
  const lower = bankName.toLowerCase().trim();
  if (BANK_THEMES[lower]) return BANK_THEMES[lower];
  let best: BankTheme | null = null;
  let bestLen = 0;
  for (const [key, theme] of Object.entries(BANK_THEMES)) {
    if (lower.includes(key) && key.length > bestLen) {
      best = theme;
      bestLen = key.length;
    }
  }
  return best;
}

function getInitials(bankName: string): string {
  const words = bankName.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .filter((w) => !["of", "the", "and", "&"].includes(w.toLowerCase()))
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const FALLBACK_COLORS = [
  { bg: "#1A3A8F", accent: "#FFD700" },
  { bg: "#8F1A1A", accent: "#FFD700" },
  { bg: "#1A6B1A", accent: "#FFD700" },
  { bg: "#4A1A8F", accent: "#FFD700" },
  { bg: "#8F4A1A", accent: "#fff" },
];

function hashColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xfffff;
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
}

interface Props {
  bankName: string;
  size?: number;
}

export default function BankLogo({ bankName, size = 32 }: Props) {
  const theme = getTheme(bankName);
  const [imgFailed, setImgFailed] = useState(false);

  const bgColor = theme?.bg ?? hashColor(bankName).bg;
  const accentColor = theme?.accent ?? hashColor(bankName).accent;
  const initials = theme?.abbr ?? getInitials(bankName);

  // Only try image if we have a known domain
  const logoUrl =
    !imgFailed && theme?.domain
      ? `https://logo.clearbit.com/${theme.domain}`
      : null;

  const abbrevFontSize = initials.length <= 3 ? size * 0.32 : size * 0.26;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2,
        background: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
        border: `1.5px solid ${accentColor}33`,
        position: "relative",
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={bankName}
          onError={() => setImgFailed(true)}
          style={{
            width: size * 0.75,
            height: size * 0.75,
            objectFit: "contain",
          }}
        />
      ) : (
        <>
          {/* Diagonal accent line for official look */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: size * 0.35,
              height: size * 0.35,
              background: `${accentColor}22`,
              clipPath: "polygon(100% 0, 0 0, 100% 100%)",
            }}
          />
          <span
            style={{
              color: accentColor,
              fontSize: abbrevFontSize,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textAlign: "center",
              position: "relative",
              zIndex: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.4)",
            }}
          >
            {initials}
          </span>
        </>
      )}
    </div>
  );
}
