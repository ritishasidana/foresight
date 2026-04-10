/**
 * useAnalysis.js
 * --------------
 * Custom hook that owns all application state and API interactions.
 * Components stay pure — they receive data and callbacks, never call APIs directly.
 */

import { useState, useCallback } from 'react'
import {
  uploadFile,
  runAnalysis,
  explainAnomaly,
  runCustomScenario,
  askQuestion,
} from '../utils/api.js'

const DEMO_DATASETS = [
  { label: 'Customer churn rate', file: '/data/churn_weekly.csv',        dateCol: 'week', valueCol: 'churn_rate_pct' },
  { label: 'Branch transactions',  file: '/data/transactions_weekly.csv', dateCol: 'week', valueCol: 'transaction_volume' },
  { label: 'Login success rate',   file: '/data/logins_weekly.csv',       dateCol: 'week', valueCol: 'login_success_rate_pct' },
]

export function useAnalysis() {
  // Upload state
  const [uploadInfo, setUploadInfo]   = useState(null)
  const [dateCol, setDateCol]         = useState('')
  const [valueCol, setValueCol]       = useState('')
  const [periods, setPeriods]         = useState(4)
  const [datasetLabel, setDatasetLabel] = useState('')

  // Results state
  const [results, setResults]         = useState(null)

  // UI state
  const [step, setStep]               = useState('upload') // upload | configure | dashboard
  const [loading, setLoading]         = useState(false)
  const [loadingMsg, setLoadingMsg]   = useState('')
  const [error, setError]             = useState(null)

  // Per-anomaly explanation cache
  const [anomalyExplanations, setAnomalyExplanations] = useState({})
  const [loadingAnomalyIdx, setLoadingAnomalyIdx]     = useState(null)

  // Q&A state
  const [question, setQuestion]       = useState('')
  const [answer, setAnswer]           = useState(null)
  const [loadingAnswer, setLoadingAnswer] = useState(false)

  // ── Upload ────────────────────────────────────────────────────────────

  const handleUpload = useCallback(async (file) => {
    setLoading(true)
    setLoadingMsg('Reading your file…')
    setError(null)
    try {
      const info = await uploadFile(file)
      setUploadInfo(info)
      setDateCol(info.date_col || info.columns[0])
      setValueCol(info.value_cols?.[0] || info.columns[1])
      setDatasetLabel(file.name.replace('.csv', '').replace(/_/g, ' '))
      setStep('configure')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Upload failed. Please try a valid CSV.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Load demo dataset by fetching from /data/ ─────────────────────────

  const handleLoadDemo = useCallback(async (demoIdx) => {
    const demo = DEMO_DATASETS[demoIdx]
    setLoading(true)
    setLoadingMsg('Loading demo dataset…')
    setError(null)
    try {
      const resp = await fetch(demo.file)
      const text = await resp.text()
      const blob = new Blob([text], { type: 'text/csv' })
      const file = new File([blob], `${demo.label}.csv`, { type: 'text/csv' })
      const info = await uploadFile(file)
      setUploadInfo(info)
      setDateCol(demo.dateCol)
      setValueCol(demo.valueCol)
      setDatasetLabel(demo.label)
      setStep('configure')
    } catch (e) {
      setError('Could not load demo dataset.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Run analysis ──────────────────────────────────────────────────────

  const handleAnalyse = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    setAnomalyExplanations({})
    setAnswer(null)

    const steps = [
      'Checking data quality…',
      'Running ETS forecast…',
      'Detecting anomalies…',
      'Backtesting accuracy…',
      'Generating AI summary…',
    ]
    let i = 0
    setLoadingMsg(steps[i])
    const interval = setInterval(() => {
      i = Math.min(i + 1, steps.length - 1)
      setLoadingMsg(steps[i])
    }, 1200)

    try {
      const data = await runAnalysis({
        date_col: dateCol,
        value_col: valueCol,
        periods,
        dataset_label: datasetLabel,
      })
      setResults(data)
      setStep('dashboard')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Analysis failed. Please check your column selection.')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }, [dateCol, valueCol, periods, datasetLabel])

  // ── Anomaly explanation ───────────────────────────────────────────────

  const handleExplainAnomaly = useCallback(async (index) => {
    if (anomalyExplanations[index]) return // already cached
    setLoadingAnomalyIdx(index)
    try {
      const { explanation } = await explainAnomaly(index)
      setAnomalyExplanations(prev => ({ ...prev, [index]: explanation }))
    } catch {
      setAnomalyExplanations(prev => ({
        ...prev,
        [index]: 'Could not generate explanation. Please try again.',
      }))
    } finally {
      setLoadingAnomalyIdx(null)
    }
  }, [anomalyExplanations])

  // ── Custom scenario ───────────────────────────────────────────────────

  const handleCustomScenario = useCallback(async (growthPct) => {
    try {
      const scenario = await runCustomScenario(growthPct, periods)
      setResults(prev => ({
        ...prev,
        scenarios: { ...prev.scenarios, custom: scenario },
      }))
    } catch {
      // Silently fail — scenario panel shows previous state
    }
  }, [periods])

  // ── Q&A ───────────────────────────────────────────────────────────────

  const handleAsk = useCallback(async () => {
    if (!question.trim()) return
    setLoadingAnswer(true)
    setAnswer(null)
    try {
      const resp = await askQuestion(question, datasetLabel)
      setAnswer(resp.answer)
    } catch {
      setAnswer('Sorry, could not answer that question right now.')
    } finally {
      setLoadingAnswer(false)
    }
  }, [question, datasetLabel])

  // ── Reset ─────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setStep('upload')
    setUploadInfo(null)
    setResults(null)
    setError(null)
    setAnswer(null)
    setQuestion('')
    setAnomalyExplanations({})
  }, [])

  return {
    // State
    step, loading, loadingMsg, error,
    uploadInfo, dateCol, setDateCol,
    valueCol, setValueCol,
    periods, setPeriods,
    datasetLabel, setDatasetLabel,
    results,
    anomalyExplanations, loadingAnomalyIdx,
    question, setQuestion, answer, loadingAnswer,
    // Actions
    handleUpload, handleLoadDemo, handleAnalyse,
    handleExplainAnomaly, handleCustomScenario,
    handleAsk, handleReset,
    // Constants
    DEMO_DATASETS,
  }
}
