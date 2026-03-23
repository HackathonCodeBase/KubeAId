import { useState, useEffect, useRef, useCallback } from 'react'
import Header from './components/Header'
import SystemStatusCard from './components/SystemStatusCard'
import MetricsPanel from './components/MetricsPanel'
import AIDiagnosisPanel from './components/AIDiagnosisPanel'
import ActionPanel from './components/ActionPanel'
import HistoryPanel from './components/HistoryPanel'

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY
const POLL_INTERVAL = 5000

export default function App() {
  const [systemData, setSystemData] = useState({
    metrics: { cpu: 30, memory: 40, status: 'healthy' },
    logs: [], issue: null, severity: null, action: null, status: 'ok',
  })
  const [cpuHistory, setCpuHistory] = useState([30])
  const [diagnosis, setDiagnosis] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [lastAction, setLastAction] = useState(null)
  const [incidentHistory, setIncidentHistory] = useState([])
  const pollRef = useRef(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/status')
      const data = await res.json()
      setSystemData(data)
      setCpuHistory(prev => [...prev.slice(-9), data.metrics.cpu])
    } catch (err) {
      console.error('Status fetch failed:', err)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/history')
      const data = await res.json()
      setIncidentHistory(data.history || [])
    } catch (err) {
      console.error('History fetch failed:', err)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [fetchStatus])

  const runAIDiagnosis = useCallback(async (data) => {
    if (!OPENAI_KEY) {
      // Fallback rule-based diagnosis when no API key is set
      setDiagnosis({
        cause: `Issue: ${data.issue}. CPU: ${data.metrics.cpu}%, Memory: ${data.metrics.memory}%.`,
        fix: data.issue === 'high_cpu' ? 'Scale pod replicas to redistribute CPU load.'
          : data.issue === 'memory_spike' ? 'Flush memory caches and restart idle containers.'
            : 'Restart timed-out pods to restore service.',
        reasoning: 'Rule-based diagnosis (no OpenAI key configured).',
      })
      return
    }

    setAiLoading(true)
    setDiagnosis(null)
    try {
      const prompt = `You are a Kubernetes SRE AI. Given this system state, respond ONLY with valid JSON:
CPU: ${data.metrics.cpu}%, Memory: ${data.metrics.memory}%, Status: ${data.metrics.status}
Issue: ${data.issue}, Severity: ${data.severity}
Logs: ${data.logs.join('; ') || 'none'}

{"cause":"...","fix":"...","reasoning":"..."}`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3, max_tokens: 300,
        }),
      })
      const json = await res.json()
      setDiagnosis(JSON.parse(json.choices?.[0]?.message?.content || '{}'))
    } catch (err) {
      setDiagnosis({ cause: 'OpenAI unreachable.', fix: 'Check VITE_OPENAI_API_KEY.', reasoning: err.message })
    } finally {
      setAiLoading(false)
    }
  }, [])

  const handleSimulate = async () => {
    setSimulating(true)
    setLastAction(null)
    try {
      const res = await fetch('/simulate', { method: 'POST' })
      const data = await res.json()
      setSystemData(data)
      setCpuHistory(prev => [...prev.slice(-9), data.metrics.cpu])
      if (data.issue) await runAIDiagnosis(data)
      await fetchHistory()
    } catch (err) { console.error(err) }
    finally { setSimulating(false) }
  }

  const handleFix = async () => {
    setFixing(true)
    try {
      const res = await fetch('/fix', { method: 'POST' })
      const data = await res.json()
      setSystemData(data)
      setCpuHistory(prev => [...prev.slice(-9), data.metrics.cpu])
      setLastAction(data.action)
      setDiagnosis(null)
      await fetchHistory()
    } catch (err) { console.error(err) }
    finally { setFixing(false) }
  }

  const handleReset = async () => {
    try {
      const res = await fetch('/reset', { method: 'POST' })
      const data = await res.json()
      setSystemData(data)
      setCpuHistory([30])
      setDiagnosis(null)
      setLastAction(null)
      setIncidentHistory([])
    } catch (err) { console.error(err) }
  }

  const { metrics, logs, issue, severity } = systemData

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Ambient red glow on critical */}
      {metrics.status !== 'healthy' && (
        <div className="fixed top-0 left-0 w-full h-1 bg-[#CC0000] z-50" />
      )}

      <Header status={metrics.status} />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">DASHBOARD</h1>
          <p className="text-[11px] text-white/25 uppercase tracking-[0.25em] mt-1">
            DETECT → DIAGNOSE → FIX → RECOVER
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SystemStatusCard status={metrics.status} issue={issue} severity={severity} />
          <MetricsPanel cpu={metrics.cpu} memory={metrics.memory} cpuHistory={cpuHistory} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIDiagnosisPanel diagnosis={diagnosis} loading={aiLoading} />
          <ActionPanel
            onSimulate={handleSimulate}
            onFix={handleFix}
            onReset={handleReset}
            logs={logs}
            action={lastAction || systemData.action}
            simulating={simulating}
            fixing={fixing}
          />
        </div>

        <HistoryPanel history={incidentHistory} />

        <p className="text-center text-white/10 text-[10px] uppercase tracking-[0.2em] pb-4">
          KUBEAID v1.0 · POLLING {POLL_INTERVAL / 1000}s · {metrics.status.toUpperCase()}
        </p>
      </main>
    </div>
  )
}
