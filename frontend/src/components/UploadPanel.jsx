/**
 * UploadPanel.jsx
 * ---------------
 * Landing screen. Accepts CSV via drag-and-drop or file picker.
 * Also shows three one-click demo dataset buttons for instant demo.
 */

import { useRef, useState } from 'react'

export default function UploadPanel({ onUpload, onLoadDemo, loading, error, demoDatasets }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) onUpload(file)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) onUpload(file)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">

      {/* Logo / header */}
      <div className="mb-10 text-center animate-fade-in">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-nw-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.94" />
            </svg>
          </div>
          <span className="text-2xl font-semibold text-gray-900">ForeSight</span>
        </div>
        <p className="text-gray-500 text-base max-w-sm">
          Upload any time-series CSV and get honest AI-powered forecasts,
          anomaly alerts, and plain-English insights in under 30 seconds.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`w-full max-w-lg rounded-2xl border-2 border-dashed p-12 text-center
          transition-colors duration-200 cursor-pointer
          ${dragging ? 'border-nw-600 bg-nw-50' : 'border-gray-200 bg-white hover:border-nw-400 hover:bg-nw-50'}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-nw-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-nw-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          {loading ? (
            <p className="text-nw-600 font-medium">Reading your file…</p>
          ) : (
            <>
              <p className="font-medium text-gray-800">
                Drop your CSV here, or <span className="text-nw-600">browse</span>
              </p>
              <p className="text-sm text-gray-400">
                Any time-series CSV — sales, churn, traffic, transactions
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 w-full max-w-lg rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Demo datasets */}
      <div className="mt-8 w-full max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 text-center">
          Or try a demo dataset
        </p>
        <div className="grid grid-cols-3 gap-3">
          {demoDatasets.map((d, i) => (
            <button
              key={i}
              onClick={() => onLoadDemo(i)}
              disabled={loading}
              className="card p-4 text-left hover:border-nw-200 hover:bg-nw-50 transition-colors duration-150 disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-nw-100 flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-nw-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-700 leading-tight">{d.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-gray-400 text-center max-w-sm">
        No personal data required or stored. All analysis runs in-session only.
      </p>
    </div>
  )
}
