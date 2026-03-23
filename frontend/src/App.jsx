import { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import SystemStatusCard from "./components/SystemStatusCard";
import MetricsPanel from "./components/MetricsPanel";
import AIDiagnosisPanel from "./components/AIDiagnosisPanel";
import ActionPanel from "./components/ActionPanel";
import HistoryPanel from "./components/HistoryPanel";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const POLL_INTERVAL = 5000;
const AUTO_HEAL_INJECT_INTERVAL = 8000;
const AUTO_HEAL_FIX_DELAY = 4000;

export default function App() {
  const [systemData, setSystemData] = useState({
    metrics: { cpu: 30, memory: 40, status: "healthy" },
    logs: [],
    issue: null,
    severity: null,
    action: null,
    status: "ok",
  });
  const [cpuHistory, setCpuHistory] = useState([30]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [autoHeal, setAutoHeal] = useState(false);
  const pollRef = useRef(null);
  const autoHealRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/status");
      const data = await res.json();
      setSystemData(data);
      setCpuHistory((prev) => [...prev.slice(-9), data.metrics.cpu]);
    } catch (err) {
      console.error("Status fetch failed:", err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/history");
      const data = await res.json();
      setIncidentHistory(data.history || []);
    } catch (err) {
      console.error("History fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchStatus]);

  const runAIDiagnosis = useCallback(async (data, isManual = true) => {
    const getRuleBasedDiagnosis = (issue, metrics) => ({
      cause: `Issue: ${issue}. CPU: ${metrics.cpu}%, Memory: ${metrics.memory}%.`,
      fix:
        issue === "high_cpu"
          ? "Scale pod replicas to redistribute CPU load."
          : issue === "predictive_degradation"
            ? "Pre-emptively scale replicas to prevent memory/CPU exhaustion."
            : issue === "memory_spike"
              ? "Flush memory caches and restart idle containers."
              : issue === "memory_leak"
                ? "Restart leaking pod and update resource limits dynamically."
                : issue === "crashloopbackoff"
                  ? "Rollback deployment to previous stable ReplicaSet."
                  : issue === "config_error"
                    ? "Revert ConfigMap to last known good state and restart pods."
                    : issue === "image_pull_error"
                      ? "Switch to fallback replica registry and deploy successfully."
                      : "Restart timed-out pods and shift traffic to secondary node.",
      reasoning: isManual
        ? "AI diagnosis (Gemini)"
        : "Rule-based (auto-heal mode).",
    });

    // In auto-heal mode, always use rule-based (no API calls)
    if (!isManual) {
      setDiagnosis(getRuleBasedDiagnosis(data.issue, data.metrics));
      return;
    }

    setAiLoading(true);
    setDiagnosis(null);
    try {
      const res = await fetch(`${API_BASE}/ai/diagnose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue: data.issue,
          metrics: data.metrics,
          logs: data.logs,
          severity: data.severity,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`AI proxy error: ${res.status}`);
        console.error("AI proxy response body:", errText);
        setDiagnosis(getRuleBasedDiagnosis(data.issue, data.metrics));
        return;
      }

      const json = await res.json();
      if (json.cause && json.fix && json.reasoning) {
        setDiagnosis(json);
      } else {
        setDiagnosis(getRuleBasedDiagnosis(data.issue, data.metrics));
      }
    } catch (err) {
      console.error("Diagnosis error:", err.message);
      setDiagnosis(getRuleBasedDiagnosis(data.issue, data.metrics));
    } finally {
      setAiLoading(false);
    }
  }, []);

  const handleSimulate = async (type = null) => {
    setSimulating(true);
    setLastAction(null);
    try {
      const url =
        type === "predictive_degradation"
          ? "/simulate/degradation"
          : type
            ? `/simulate?type=${type}`
            : "/simulate";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      setSystemData(data);
      setCpuHistory((prev) => [...prev.slice(-9), data.metrics.cpu]);
      if (data.issue) await runAIDiagnosis(data);
      await fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleFix = async () => {
    setFixing(true);
    try {
      const res = await fetch("/fix", { method: "POST" });
      const data = await res.json();
      setSystemData(data);
      setCpuHistory((prev) => [...prev.slice(-9), data.metrics.cpu]);
      setLastAction(data.action);
      setDiagnosis(null);
      await fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setFixing(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await fetch("/reset", { method: "POST" });
      const data = await res.json();
      setSystemData(data);
      setCpuHistory([30]);
      setDiagnosis(null);
      setLastAction(null);
      setIncidentHistory([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-Heal Loop
  useEffect(() => {
    if (!autoHeal) {
      clearInterval(autoHealRef.current);
      return;
    }

    const runCycle = async () => {
      // Phase 1: Inject a random anomaly
      setSimulating(true);
      setLastAction(null);
      try {
        const res = await fetch("/simulate", { method: "POST" });
        const data = await res.json();
        setSystemData(data);
        setCpuHistory((prev) => [...prev.slice(-9), data.metrics.cpu]);
        if (data.issue) await runAIDiagnosis(data, false); // isManual = false (use rule-based)
        await fetchHistory();
      } catch (err) {
        console.error(err);
      } finally {
        setSimulating(false);
      }

      // Phase 2: Wait, then auto-fix
      await new Promise((r) => setTimeout(r, AUTO_HEAL_FIX_DELAY));

      setFixing(true);
      try {
        const res = await fetch("/fix", { method: "POST" });
        const data = await res.json();
        setSystemData(data);
        setCpuHistory((prev) => [...prev.slice(-9), data.metrics.cpu]);
        setLastAction(data.action);
        // Keep diagnosis visible during auto-heal
        await fetchHistory();
      } catch (err) {
        console.error(err);
      } finally {
        setFixing(false);
      }
    };

    runCycle();
    autoHealRef.current = setInterval(
      runCycle,
      AUTO_HEAL_INJECT_INTERVAL + AUTO_HEAL_FIX_DELAY,
    );

    return () => clearInterval(autoHealRef.current);
  }, [autoHeal, runAIDiagnosis, fetchHistory]);

  const { metrics, logs, issue, severity } = systemData;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Ambient red glow on critical */}
      {metrics.status !== "healthy" && (
        <div className="fixed top-0 left-0 w-full h-1 bg-[#CC0000] z-50" />
      )}

      <Header status={metrics.status} />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            DASHBOARD
          </h1>
          <p className="text-[11px] text-white/25 uppercase tracking-[0.25em] mt-1">
            DETECT → DIAGNOSE → FIX → RECOVER
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SystemStatusCard
            status={metrics.status}
            issue={issue}
            severity={severity}
          />
          <MetricsPanel
            cpu={metrics.cpu}
            memory={metrics.memory}
            cpuHistory={cpuHistory}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIDiagnosisPanel diagnosis={diagnosis} loading={aiLoading} />
          <ActionPanel
            onSimulate={handleSimulate}
            onFix={handleFix}
            onReset={handleReset}
            logs={logs}
            action={lastAction}
            simulating={simulating}
            fixing={fixing}
            currentIssue={issue}
            confidence={systemData.confidence}
            autoHeal={autoHeal}
            onToggleAutoHeal={() => setAutoHeal((prev) => !prev)}
          />
        </div>

        <HistoryPanel history={incidentHistory} />

        <p className="text-center text-white/10 text-[10px] uppercase tracking-[0.2em] pb-4">
          KUBEAID v1.0 · POLLING {POLL_INTERVAL / 1000}s ·{" "}
          {metrics.status.toUpperCase()}
          {autoHeal && " · AUTO-HEAL ACTIVE"}
        </p>
      </main>
    </div>
  );
}
