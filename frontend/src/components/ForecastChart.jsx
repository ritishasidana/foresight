/**
 * ForecastChart.jsx
 * -----------------
 * The primary chart. Shows:
 *  - Historical line (grey)
 *  - Forecast line (NatWest purple, dashed, animated reveal)
 *  - 80% confidence band (purple shaded area)
 *  - Naive baseline (amber dashed)
 *  - Anomaly markers (red/amber dots on historical line)
 *
 * Animation: forecast line and band fade in 800ms after mount
 * using CSS opacity transition — gives the "thinking forward" effect.
 */

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceDot,
} from 'recharts'
import { fmtNumber, fmtDate, severityColour } from '../utils/formatters.js'

// Merge historical + forecast into one array for Recharts
function buildChartData(forecast, anomalies) {
  const anomalyDates = new Set(anomalies.map(a => a.date))

  const historical = forecast.historical_dates.map((d, i) => ({
    date:       d,
    historical: forecast.historical_values[i],
    isAnomaly:  anomalyDates.has(d),
  }))

  const future = forecast.dates.map((d, i) => ({
    date:      d,
    predicted: forecast.forecast[i],
    bandLow:   forecast.band_low[i],
    bandHigh:  forecast.band_high[i],
    // naive baseline from last historical value
    naive:     forecast.historical_values[forecast.historical_values.length - 1],
  }))

  return [...historical, ...future]
}

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-lg px-3 py-2.5 text-xs">
      <p className="font-medium text-gray-700 mb-1.5">{fmtDate(label)}</p>
      {payload.map(p => (
        p.value !== undefined && p.value !== null &&
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">
            {p.dataKey === 'bandHigh' ? 'Upper band' :
             p.dataKey === 'bandLow'  ? 'Lower band' :
             p.dataKey}:
          </span>
          <span className="font-medium text-gray-800 ml-auto pl-3">
            {fmtNumber(p.value, 2)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ForecastChart({ forecast, anomalies, validationWinner }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, [forecast])

  const data = buildChartData(forecast, anomalies)
  const showBaseline = validationWinner !== 'ets'

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Forecast</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Historical data + {forecast.dates.length}-period forecast with 80% confidence band
          </p>
        </div>
        {/* {showBaseline && (
          <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700
                           px-2 py-1 rounded-lg font-medium">
            Naive baseline beats ETS on this dataset
          </span>
        )} */}
            {showBaseline && (
      <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700
                      px-2 py-1 rounded-lg font-medium">
        {validationWinner === 'naive'
          ? 'Naive baseline beats ETS on this dataset'
          : 'Moving average beats ETS on this dataset'}
      </span>
    )}
      </div>

      {/* Chart */}
      <div
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease-out' }}
        className="h-72"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={d => {
                const dt = new Date(d)
                return `${dt.toLocaleString('en-GB', { month: 'short' })} '${String(dt.getFullYear()).slice(2)}`
              }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={v => fmtNumber(v)}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="line"
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />

            {/* Confidence band — render as area between bandLow and bandHigh */}
            <Area
              dataKey="bandHigh"
              stroke="none"
              fill="#6941C6"
              fillOpacity={0.08}
              legendType="none"
              name="Upper band"
              isAnimationActive={true}
              animationDuration={900}
            />
            <Area
              dataKey="bandLow"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
              legendType="none"
              name="Lower band"
              isAnimationActive={true}
              animationDuration={900}
            />

            {/* Historical line */}
            <Line
              dataKey="historical"
              stroke="#6b7280"
              strokeWidth={2}
              dot={false}
              name="Historical"
              isAnimationActive={false}
              connectNulls
            />

            {/* Forecast line */}
            <Line
              dataKey="predicted"
              stroke="#6941C6"
              strokeWidth={2.5}
              strokeDasharray="5 3"
              dot={{ r: 3, fill: '#6941C6', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name="Forecast"
              isAnimationActive={true}
              animationDuration={900}
              connectNulls
            />

            {/* Naive baseline — only shown when it beats ETS */}
            {showBaseline && (
              <Line
                dataKey="naive"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                name="Naive baseline"
                isAnimationActive={false}
                connectNulls
              />
            )}

            {/* Anomaly markers */}
            {anomalies.map((a, i) => {
              const sc = severityColour(a.severity)
              return (
                <ReferenceDot
                  key={i}
                  x={a.date}
                  y={a.value}
                  r={5}
                  fill={a.severity === 'critical' ? '#ef4444' : a.severity === 'warning' ? '#f59e0b' : '#fbbf24'}
                  stroke="white"
                  strokeWidth={1.5}
                />
              )
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Band legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-8 h-0.5 bg-nw-600 opacity-20 rounded inline-block" style={{ height: 8, borderRadius: 2, background: 'rgba(105,65,198,0.15)' }} />
          80% confidence band
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
          Anomaly detected
        </span>
      </div>
    </div>
  )
}
