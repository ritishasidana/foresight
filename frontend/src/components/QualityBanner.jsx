/**
 * QualityBanner.jsx
 * -----------------
 * Compact banner shown at the top of the dashboard showing the
 * data quality verdict and any issues found before forecasting.
 * Green = clean, amber = warnings present, red = poor quality.
 */

export default function QualityBanner({ quality }) {
  if (!quality) return null

  const colours = {
    clean:   { bar: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    warning: { bar: 'bg-amber-400',   bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   dot: 'bg-amber-400' },
    poor:    { bar: 'bg-red-400',      bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     dot: 'bg-red-400' },
  }
  const c = colours[quality.verdict] || colours.warning

  const summary = quality.verdict === 'clean'
    ? `${quality.n_rows} observations · ${quality.date_start} to ${quality.date_end} · No issues found`
    : `${quality.n_rows} observations · ${quality.date_start} to ${quality.date_end}`

  return (
    <div className={`rounded-xl border px-4 py-3 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold ${c.text}`}>
              Data quality: {quality.verdict === 'clean' ? 'Clean' : quality.verdict === 'warning' ? 'Warning' : 'Poor'}
            </span>
            <span className={`text-xs ${c.text} opacity-70`}>{summary}</span>
          </div>
          {quality.issues?.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {quality.issues.map((issue, i) => (
                <li key={i} className={`text-xs ${c.text} opacity-80`}>· {issue}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
