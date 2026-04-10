/**
 * LoadingOverlay.jsx
 * ------------------
 * Full-screen overlay shown while the analysis pipeline runs.
 * Cycles through step messages so the user knows what is happening
 * rather than seeing a blank spinner.
 */

export default function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center
                    justify-center z-50">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        {/* Animated logo mark */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-2xl bg-nw-600 opacity-10 animate-ping" />
          <div className="relative w-14 h-14 rounded-2xl bg-nw-600 flex items-center
                          justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor"
                 strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.94" />
            </svg>
          </div>
        </div>

        {/* Step message */}
        <div>
          <p className="text-base font-medium text-gray-900">{message}</p>
          <p className="text-sm text-gray-400 mt-1">This takes a few seconds…</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-nw-600"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
