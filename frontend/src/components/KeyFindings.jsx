/**
 * KeyFindings.jsx
 * ---------------
 * Displays three proactive AI-generated findings at the top of the dashboard.
 * These appear the moment analysis completes — the system briefs the user
 * rather than waiting for them to ask questions.
 *
 * Also shows the AI forecast summary and regulation disclaimer.
 */

const ICONS = [
  // Trend arrow
  <svg key="t" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.94" />
  </svg>,
  // Warning triangle
  <svg key="w" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>,
  // Eye / watch
  <svg key="e" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
]

const FINDING_LABELS = ['Trend', 'Anomaly', 'Watch']

export default function KeyFindings({ keyFindings, narration, datasetLabel }) {
  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Key findings</h3>
          <p className="text-xs text-gray-400 mt-0.5">{datasetLabel}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-nw-600 font-medium
                        bg-nw-50 border border-nw-100 px-2.5 py-1 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          AI generated
        </div>
      </div>

      {/* 3 findings */}
      {keyFindings?.length > 0 && (
        <div className="space-y-2">
          {keyFindings.map((finding, i) => (
            finding && (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50
                           border border-gray-100 animate-fade-in"
                style={{ animationDelay: `${i * 120}ms`, opacity: 0 }}
              >
                <div className="w-7 h-7 rounded-lg bg-nw-100 flex items-center justify-center
                                text-nw-600 flex-shrink-0 mt-0.5">
                  {ICONS[i]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-nw-700 mb-0.5">
                    {FINDING_LABELS[i]}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{finding}</p>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Full AI summary */}
      {narration?.summary && (
        <div className="border-t border-gray-100 pt-4">
          <p className="section-label mb-2">Forecast summary</p>
          <p className="text-sm text-gray-700 leading-relaxed">{narration.summary}</p>
          {narration.disclaimer && (
            <p className="text-xs text-gray-400 mt-3 italic border-t border-gray-100 pt-2">
              {narration.disclaimer}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
