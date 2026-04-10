/**
 * ScenarioPanel.jsx
 * -----------------
 * Side-by-side scenario comparison:
 *  - Baseline (ETS central forecast)
 *  - Optimistic (+10%)
 *  - Pessimistic (-10%)
 *  - Custom (user-defined %)
 *
 * Chart shows all active scenarios on one axis.
 * Table below shows period-by-period values.
 */

import { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { fmtNumber, fmtDate } from '../utils/formatters.js'

function buildScenarioData(scenarios) {
  const dates = scenarios.dates
  return dates.map((d, i) => ({
    date:        d,
    baseline:    scenarios.baseline.forecast[i],
    optimistic:  scenarios.optimistic.forecast[i],
    pessimistic: scenarios.pessimistic.forecast[i],
    ...(scenarios.custom ? { custom: scenarios.custom.forecast[i] } : {}),
  }))
}

const SCENARIO_COLOURS = {
  baseline:    '#6941C6',
  optimistic:  '#10b981',
  pessimistic: '#ef4444',
  custom:      '#f59e0b',
}

export default function ScenarioPanel({ scenarios, onCustomScenario }) {
  const [customPct, setCustomPct]   = useState(15)
  const [loading, setLoading]       = useState(false)

  async function handleRunCustom() {
    setLoading(true)
    await onCustomScenario(customPct)
    setLoading(false)
  }

  const data = buildScenarioData(scenarios)

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-gray-900">Scenario comparison</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Compare outcomes under different growth assumptions
        </p>
      </div>

      {/* Scenario chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={d => fmtDate(d).split(' ').slice(0, 2).join(' ')}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              width={52}
              tickFormatter={v => fmtNumber(v)}
            />
            <Tooltip
              formatter={(v, name) => [fmtNumber(v, 2), name]}
              labelFormatter={d => fmtDate(d)}
            />
            <Legend iconType="line" wrapperStyle={{ fontSize: 11 }} />
            <Line dataKey="baseline"    stroke={SCENARIO_COLOURS.baseline}    strokeWidth={2}
                  dot={{ r: 3 }} name="Baseline" isAnimationActive={true} animationDuration={600} />
            <Line dataKey="optimistic"  stroke={SCENARIO_COLOURS.optimistic}  strokeWidth={2}
                  strokeDasharray="4 2" dot={{ r: 3 }} name="Optimistic (+10%)"
                  isAnimationActive={true} animationDuration={600} />
            <Line dataKey="pessimistic" stroke={SCENARIO_COLOURS.pessimistic} strokeWidth={2}
                  strokeDasharray="4 2" dot={{ r: 3 }} name="Pessimistic (−10%)"
                  isAnimationActive={true} animationDuration={600} />
            {scenarios.custom && (
              <Line dataKey="custom" stroke={SCENARIO_COLOURS.custom} strokeWidth={2}
                    strokeDasharray="2 2" dot={{ r: 3 }}
                    name={`Custom (${scenarios.custom.growth_pct > 0 ? '+' : ''}${scenarios.custom.growth_pct}%)`}
                    isAnimationActive={true} animationDuration={600} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Period</th>
              <th className="text-right px-3 py-2.5 font-semibold" style={{ color: SCENARIO_COLOURS.baseline }}>Baseline</th>
              <th className="text-right px-3 py-2.5 font-semibold" style={{ color: SCENARIO_COLOURS.optimistic }}>+10%</th>
              <th className="text-right px-3 py-2.5 font-semibold" style={{ color: SCENARIO_COLOURS.pessimistic }}>−10%</th>
              {scenarios.custom && (
                <th className="text-right px-3 py-2.5 font-semibold"
                    style={{ color: SCENARIO_COLOURS.custom }}>
                  Custom
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => (
              <tr key={i} className="bg-white hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 text-gray-500">{fmtDate(row.date)}</td>
                <td className="px-3 py-2 text-right font-medium text-gray-800">
                  {fmtNumber(row.baseline, 2)}
                </td>
                <td className="px-3 py-2 text-right text-emerald-700">
                  {fmtNumber(row.optimistic, 2)}
                </td>
                <td className="px-3 py-2 text-right text-red-600">
                  {fmtNumber(row.pessimistic, 2)}
                </td>
                {scenarios.custom && (
                  <td className="px-3 py-2 text-right text-amber-700">
                    {fmtNumber(row.custom, 2)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom scenario builder */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-600 mb-3">Custom scenario</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Growth assumption</span>
              <span className="font-semibold text-nw-600">
                {customPct > 0 ? '+' : ''}{customPct}%
              </span>
            </div>
            <input
              type="range" min={-50} max={50} step={1}
              value={customPct}
              onChange={e => setCustomPct(Number(e.target.value))}
              className="w-full accent-nw-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>−50%</span><span>0</span><span>+50%</span>
            </div>
          </div>
          <button
            onClick={handleRunCustom}
            disabled={loading}
            className="btn-primary flex items-center gap-1.5 whitespace-nowrap"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor"
                   strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/>
              </svg>
            )}
            Run
          </button>
        </div>
      </div>
    </div>
  )
}
