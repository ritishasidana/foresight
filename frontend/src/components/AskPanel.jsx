/**
 * AskPanel.jsx
 * ------------
 * Free-text input that lets users ask plain-English questions
 * about their data. Claude answers from the forecast context —
 * not from generic knowledge — so answers are specific and grounded.
 */

import { useState } from 'react'

const SUGGESTED_QUESTIONS = [
  'Why might the forecast be declining?',
  'When is the next expected peak?',
  'Should I be concerned about any anomalies?',
  'How reliable is this forecast?',
]

export default function AskPanel({ question, setQuestion, onAsk, answer, loading }) {
  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onAsk()
    }
  }

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">Ask a question</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Ask anything about your data — answers are grounded in your forecast results
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. Why was week 45 so high?"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-nw-600 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={onAsk}
          disabled={loading || !question.trim()}
          className="btn-primary flex items-center gap-1.5"
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
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
            </svg>
          )}
          Ask
        </button>
      </div>

      {/* Suggested questions */}
      {!answer && !loading && (
        <div>
          <p className="text-xs text-gray-400 mb-2">Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => { setQuestion(q); }}
                className="text-xs bg-gray-50 border border-gray-200 hover:border-nw-300
                           hover:bg-nw-50 text-gray-600 px-3 py-1.5 rounded-full
                           transition-colors duration-150"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Answer */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4 animate-spin text-nw-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Thinking…
        </div>
      )}

      {answer && !loading && (
        <div className="bg-nw-50 border border-nw-100 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-nw-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span className="text-xs font-semibold text-nw-700">ForeSight</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}
