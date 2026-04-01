import { useState } from 'react'
import { saveConfig, getConfig } from '../services/config'
import { apiHealthCheck } from '../services/api'

export default function SetupScreen({ onComplete }) {
  const existing = getConfig()
  const [apiUrl, setApiUrl] = useState(existing.apiUrl || 'https://api.dev.locqar.com')
  const [apiKey, setApiKey] = useState(existing.apiKey || '')
  const [lockerSN, setLockerSN] = useState(existing.lockerSN || '')
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState(null)

  const testConnection = async () => {
    setTesting(true)
    setStatus(null)
    // Temporarily save so the API service can use it
    saveConfig({ apiUrl, apiKey, lockerSN })
    try {
      const ok = await apiHealthCheck()
      if (ok) {
        setStatus({ ok: true, msg: 'Connected to API' })
      } else {
        setStatus({ ok: false, msg: 'API returned non-200' })
      }
    } catch (err) {
      setStatus({ ok: false, msg: err.message || 'Connection failed' })
    }
    setTesting(false)
  }

  const handleSave = () => {
    if (!lockerSN.trim()) {
      setStatus({ ok: false, msg: 'Locker serial number is required' })
      return
    }
    if (!apiKey.trim()) {
      setStatus({ ok: false, msg: 'API key is required' })
      return
    }
    saveConfig({ apiUrl, apiKey, lockerSN })
    onComplete()
  }

  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">LocQar Kiosk Setup</h1>
          <p className="text-slate-400 text-sm mt-1">Configure this terminal to connect to your locker</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Locker Serial Number</label>
            <input
              type="text"
              value={lockerSN}
              onChange={e => setLockerSN(e.target.value)}
              placeholder="e.g. LQ-001"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Your locker API key"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">API URL</label>
            <input
              type="url"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              placeholder="https://api.dev.locqar.com"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status */}
          {status && (
            <div className={`px-4 py-3 rounded-xl text-sm ${status.ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
              {status.ok ? '✓' : '✗'} {status.msg}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={testConnection}
              disabled={testing}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {testing ? 'Testing…' : 'Test Connection'}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
            >
              Save & Start
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          After setup, add this page to your home screen for kiosk mode
        </p>
      </div>
    </div>
  )
}
