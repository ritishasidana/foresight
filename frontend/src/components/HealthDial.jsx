/**
 * HealthDial.jsx
 * --------------
 * Animated SVG dial displaying the Forecast Health Score (0–100).
 * Colour reflects label: green ≥70, amber ≥40, red <40.
 * Arc animates on mount using CSS stroke-dashoffset transition.
 */

import { useEffect, useState } from 'react'
import { healthColour } from '../utils/formatters.js'

export default function HealthDial({ score, label }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t) }, [])

  const colour   = healthColour(label)
  const radius   = 42
  const cx = 56, cy = 56
  const circumference = Math.PI * radius          // half circle
  const filled        = animated ? (score / 100) * circumference : 0

  const labelText = label === 'green' ? 'High trust'
                  : label === 'amber' ? 'Moderate'
                  : 'Low trust'

  return (
    <div className="flex flex-col items-center">
      <svg width="112" height="70" viewBox="0 0 112 70" aria-label={`Forecast health score: ${score} out of 100`}>
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={colour.dial}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - filled}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        {/* Score text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="600"
              fill={colour.dial} fontFamily="Inter, sans-serif">
          {score}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#9ca3af"
              fontFamily="Inter, sans-serif">
          / 100
        </text>
      </svg>
      <span className={`text-xs font-semibold mt-1 ${colour.text}`}>{labelText}</span>
    </div>
  )
}
