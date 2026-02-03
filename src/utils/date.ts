/**
 * Format date to Thai locale with short month name
 * Format: DD MMM YYYY HH:mm (e.g., "30 ม.ค. 2569 17:10")
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date to Thai locale with short month name (date only)
 * Format: DD MMM YYYY (e.g., "30 ม.ค. 2569")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
