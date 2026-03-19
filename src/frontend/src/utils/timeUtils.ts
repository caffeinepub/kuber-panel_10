/**
 * Format time with uppercase AM/PM
 */
export function fmtTimeUpper(date: Date): string {
  return date
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\b(am|pm)\b/gi, (m) => m.toUpperCase());
}

export function fmtDateTimeUpper(iso: string): string {
  try {
    const d = new Date(iso);
    const dateStr = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = fmtTimeUpper(d);
    return `${dateStr}, ${timeStr}`;
  } catch {
    return iso;
  }
}
