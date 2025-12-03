// src/lib/utils.js

/**
 * pretty date
 * @param {string|Date} iso
 */
export function formatDate(iso) {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString();
}

/**
 * truncate long text safely
 */
export function truncate(text, n = 140) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n - 1) + "…" : text;
}

/**
 * map urgency to Tailwind color class (simple)
 */
export function urgencyClass(urgency = "unknown") {
  switch ((urgency || "").toLowerCase()) {
    case "high":
      return "text-red-500 bg-red-100/20";
    case "medium":
      return "text-yellow-400 bg-yellow-100/10";
    case "low":
      return "text-green-400 bg-green-100/10";
    default:
      return "text-muted";
  }
}
