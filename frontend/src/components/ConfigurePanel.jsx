/**
 * ConfigurePanel.jsx
 * ------------------
 * Shown after upload. Lets user confirm column mapping and forecast horizon
 * before running the full analysis pipeline.
 */

export default function ConfigurePanel({
  uploadInfo, dateCol, setDateCol,
  valueCol, setValueCol,
  periods, setPeriods,
  datasetLabel, setDatasetLabel,
  onAnalyse, onBack, loading, error,
}) {
  const { columns = [], value_cols = [], rows } = uploadInfo || {}

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in">

        {/* Header */}
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Configure your forecast
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {rows} rows detected. Confirm which columns to use.
        </p>

        <div className="card p-6 space-y-5">

          {/* Dataset label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Dataset name
            </label>
            <input
              type="text"
              value={datasetLabel}
              onChange={e => setDatasetLabel(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-nw-600 focus:border-transparent"
              placeholder="e.g. Weekly sales revenue"
            />
          </div>

          {/* Date column */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date column
            </label>
            <select
              value={dateCol}
              onChange={e => setDateCol(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-nw-600 focus:border-transparent bg-white"
            >
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Value column */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Value column <span className="text-gray-400 font-normal">(what to forecast)</span>
            </label>
            <select
              value={valueCol}
              onChange={e => setValueCol(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-nw-600 focus:border-transparent bg-white"
            >
              {(value_cols.length ? value_cols : columns).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Forecast horizon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Forecast horizon — <span className="text-nw-600 font-semibold">{periods} period{periods !== 1 ? 's' : ''} ahead</span>
            </label>
            <input
              type="range" min={1} max={8} step={1}
              value={periods}
              onChange={e => setPeriods(Number(e.target.value))}
              className="w-full accent-nw-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span><span>4</span><span>8</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={onAnalyse}
            disabled={loading || !dateCol || !valueCol}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Analysing…
              </>
            ) : (
              <>
                Run forecast
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
