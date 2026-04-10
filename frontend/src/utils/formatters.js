/**
 * formatters.js
 * -------------
 * Shared number and date formatting utilities.
 * Centralised here so display logic is consistent across all components.
 */

/**
 * Format a number with commas, rounded to given decimal places.
 * e.g. 14823.6 → "14,824"
 */
export function fmtNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '—'
  return Number(value).toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format a percentage value.
 * e.g. 7.23 → "7.2%"
 */
export function fmtPct(value, decimals = 1) {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * Format an ISO date string to a readable short date.
 * e.g. "2024-03-11" → "11 Mar 2024"
 */
export function fmtDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Return a colour class based on health score label.
 */
export function healthColour(label) {
  if (label === 'green') return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dial: '#10b981' }
  if (label === 'amber') return { text: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   dial: '#f59e0b' }
  return                        { text: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',     dial: '#ef4444' }
}

/**
 * Return Tailwind colour classes for anomaly severity.
 */
export function severityColour(severity) {
  if (severity === 'critical') return { badge: 'bg-red-100 text-red-800 border-red-200',   dot: 'bg-red-500' }
  if (severity === 'warning')  return { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' }
  return                               { badge: 'bg-yellow-50 text-yellow-800 border-yellow-200', dot: 'bg-yellow-400' }
}

/**
 * Map uncertainty_label to human-readable text and colour.
 */
export function uncertaintyDisplay(label) {
  if (label === 'high_confidence')  return { text: 'High confidence',        colour: 'text-emerald-600' }
  if (label === 'moderate')         return { text: 'Moderate uncertainty',   colour: 'text-amber-600' }
  return                                    { text: 'Directional only',      colour: 'text-red-600' }
}
