/**
 * DecompositionPanel.jsx
 * -----------------------
 * Shows the three components of the time series:
 *  - Trend: the underlying long-term direction
 *  - Seasonality: the repeating cyclic pattern
 *  - Residual: what's left after trend and seasonality are removed (noise)
 *
 * Each has a plain-English label auto-generated from the data values
 * so non-technical users understand what they're looking at.
 */

import { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { fmtNumber, fmtDate } from '../utils/formatters.js'

function buildDecompData(decomp) {
  return decomp.dates.map((d, i) => ({
    date:     d,
    trend:    decomp.trend[i],
    seasonal: decomp.seasonal[i],
    residual: decomp.residual[i],
  }))
}

function trendLabel(trend) {
  if (!trend?.length) return 'Could not determine trend.'
  const first = trend[0], last = trend[trend.length - 1]
  const pct = ((last - first) / Math.abs(first)) * 100
  if (Math.abs(pct) < 2) return 'The underlying trend is essentially flat.'
  const dir = pct > 0 ? 'upward' : 'downward'
  return `The underlying trend is ${dir} — a total change of ${pct > 0 ? '+' : ''}${pct.toFixed(1)}% over the period.`
}

function seasonalLabel(seasonal) {
  if (!seasonal?.length) return 'No seasonal pattern detected.'
  const amp = Math.max(...seasonal) - Math.min(...seasonal)
  if (amp < 0.5) return 'Seasonal variation is minimal on this dataset.'
  return `There is a consistent repeating pattern with a swing of ±${(amp / 2).toFixed(2)} per cycle.`
}

function residualLabel(residual) {
  if (!residual?.length) return ''
  const std = Math.sqrt(residual.reduce((s, v) => s + v * v, 0) / residual.length)
  if (std < 0.5) return 'Residual noise is low — this data is reliable for forecasting.'
  if (std < 2)   return 'Residual noise is moderate — forecasts should be treated with reasonable caution.'
  return 'Residual noise is high — the data contains significant unexplained variation.'
}

const CHART_COLOUR = { trend: '#6941C6', seasonal: '#10b981', residual: '#9ca3af' }

export default function DecompositionPanel({ decomposition }) {
  const [open, setOpen] = useState(false)

  if (!decomposition?.dates?.length) return null

  const data = buildDecompData(decomposition)

  const panels = [
    {
      key:    'trend',
      label:  'Trend',
      desc:   trendLabel(decomposition.trend),
      colour: CHART_COLOUR.trend,
    },
    {
      key:    'seasonal',
      label:  'Seasonality',
      desc:   seasonalLabel(decomposition.seasonal),
      colour: CHART_COLOUR.seasonal,
    },
    {
      key:    'residual',
      label:  'Residual (noise)',
      desc:   residualLabel(decomposition.residual),
      colour: CHART_COLOUR.residual,
    },
  ]

  return (
    <div className="card p-5">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center justify-between w-full"
      >
        <div className="text-left">
          <h3 className="font-semibold text-gray-900">Trend decomposition</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Series split into trend, seasonality, and residual noise
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0
            ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="mt-5 space-y-5">
          {panels.map(p => (
            <div key={p.key}>
              <div className="flex items-start justify-between mb-1.5">
                <p className="text-sm font-medium text-gray-700">{p.label}</p>
              </div>
              <p className="text-xs text-gray-500 mb-2">{p.desc}</p>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 2, right: 8, bottom: 2, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9, fill: '#d1d5db' }}
                      tickFormatter={d => fmtDate(d).split(' ').slice(1).join(' ')}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: '#d1d5db' }}
                      width={44}
                      tickFormatter={v => fmtNumber(v, 1)}
                    />
                    <Tooltip
                      formatter={v => [fmtNumber(v, 2), p.label]}
                      labelFormatter={d => fmtDate(d)}
                      contentStyle={{ fontSize: 11 }}
                    />
                    <Line
                      dataKey={p.key}
                      stroke={p.colour}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={600}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
