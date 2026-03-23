"""
KubeAid Backend — AI-Powered Self-Healing Kubernetes Simulation
FastAPI MVP | Detect → Diagnose → Fix → Recover
"""

import random
from datetime import datetime
from collections import deque
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# ─────────────────────────────────────────────
# App Initialization
# ─────────────────────────────────────────────
app = FastAPI(
    title="KubeAid API",
    description="AI-Powered Self-Healing Kubernetes Environment Simulator",
    version="1.0.0",
)

# Allow all origins for hackathon demo (frontend teammate can connect freely)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Global System State
# ─────────────────────────────────────────────
system_state: dict = {
    "cpu": 30,          # CPU usage percentage (integer)
    "memory": 40,       # Memory usage percentage (integer)
    "status": "healthy",  # "healthy" | "critical"
    "error_logs": [],   # List of active error log strings
}

# Incident history — stores last 5 incidents/fixes with timestamps
incident_history: deque = deque(maxlen=5)


# ─────────────────────────────────────────────
# Pydantic Response Models
# ─────────────────────────────────────────────
class Metrics(BaseModel):
    cpu: int
    memory: int
    status: str


class IssueDetail(BaseModel):
    issue_type: Optional[str] = None
    severity: Optional[str] = None


class StatusResponse(BaseModel):
    metrics: Metrics
    logs: list[str]
    issue: Optional[str] = None
    severity: Optional[str] = None
    action: Optional[str] = None
    status: str


# ─────────────────────────────────────────────
# Detection Engine
# ─────────────────────────────────────────────
def detect_issues() -> IssueDetail:
    """
    Analyse the current system_state and detect active issues.
    Returns an IssueDetail with issue_type and severity, or None values
    when the system is healthy.

    Severity scale:
      low    — minor threshold breach
      medium — moderate concern
      high   — critical / multiple issues present
    """
    cpu = system_state["cpu"]
    memory = system_state["memory"]
    logs = system_state["error_logs"]

    issues = []

    if cpu > 80:
        issues.append("high_cpu")
    if memory > 75:
        issues.append("memory_spike")
    if logs:
        issues.append("service_timeout")

    if not issues:
        return IssueDetail(issue_type=None, severity=None)

    # Determine primary issue (first detected) and severity from count
    primary_issue = issues[0]
    if len(issues) >= 3:
        severity = "high"
    elif len(issues) == 2:
        severity = "medium"
    else:
        # Single issue — use metric levels to fine-tune severity
        if primary_issue == "high_cpu" and cpu > 90:
            severity = "high"
        elif primary_issue == "memory_spike" and memory > 88:
            severity = "high"
        else:
            severity = "low"

    return IssueDetail(issue_type=primary_issue, severity=severity)


# ─────────────────────────────────────────────
# Helper — record incident to history
# ─────────────────────────────────────────────
def record_incident(event_type: str, detail: str) -> None:
    """Push an incident or fix record into the rolling incident_history."""
    incident_history.appendleft({
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event": event_type,
        "detail": detail,
        "snapshot": {
            "cpu": system_state["cpu"],
            "memory": system_state["memory"],
            "status": system_state["status"],
        },
    })


# ─────────────────────────────────────────────
# Root Endpoint
# ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    """Root health-check — confirms the API is alive."""
    return {
        "service": "KubeAid",
        "version": "1.0.0",
        "status": "running",
        "message": "AI-Powered Self-Healing Kubernetes Backend is online.",
    }


# ─────────────────────────────────────────────
# GET /status
# ─────────────────────────────────────────────
@app.get("/status", tags=["Monitoring"])
def get_status():
    """
    Return the current system state including:
    - Live metrics (cpu, memory, status)
    - Active error logs
    - Detected issue type and severity
    """
    detected = detect_issues()
    return {
        "metrics": {
            "cpu": system_state["cpu"],
            "memory": system_state["memory"],
            "status": system_state["status"],
        },
        "logs": system_state["error_logs"],
        "issue": detected.issue_type,
        "severity": detected.severity,
        "action": None,
        "status": "ok",
    }


# ─────────────────────────────────────────────
# POST /simulate — Failure Simulation
# ─────────────────────────────────────────────
@app.post("/simulate", tags=["Simulation"])
def simulate_failure():
    """
    Randomly inject one of three failure scenarios:
      1. high_cpu       — CPU spikes above 85%
      2. memory_spike   — Memory spikes above 80%
      3. service_timeout — Timeout errors appear in logs

    Updates global system_state and records the incident.
    """
    failure_type = random.choice(["high_cpu", "memory_spike", "service_timeout"])

    if failure_type == "high_cpu":
        system_state["cpu"] = random.randint(86, 98)
        system_state["status"] = "critical"
        detail = f"CPU spiked to {system_state['cpu']}%"

    elif failure_type == "memory_spike":
        system_state["memory"] = random.randint(81, 96)
        system_state["status"] = "critical"
        detail = f"Memory spiked to {system_state['memory']}%"

    else:  # service_timeout
        timeout_messages = [
            "ERR: Pod 'api-server-7f4d' timed out after 30s",
            "ERR: Service 'auth-service' unreachable — connection refused",
            "ERR: Health-check failed on node 'worker-node-3'",
        ]
        system_state["error_logs"] = random.sample(
            timeout_messages, k=random.randint(1, len(timeout_messages))
        )
        system_state["status"] = "critical"
        detail = f"Service timeout injected — {len(system_state['error_logs'])} error(s)"

    # Record this incident in history
    record_incident(event_type="failure_injected", detail=detail)

    detected = detect_issues()
    return {
        "metrics": {
            "cpu": system_state["cpu"],
            "memory": system_state["memory"],
            "status": system_state["status"],
        },
        "logs": system_state["error_logs"],
        "issue": detected.issue_type,
        "severity": detected.severity,
        "action": None,
        "status": "simulated",
        "failure_injected": failure_type,
    }


# ─────────────────────────────────────────────
# POST /fix — Auto-Fix Engine
# ─────────────────────────────────────────────
@app.post("/fix", tags=["Remediation"])
def auto_fix():
    """
    Detect the active issue and apply the appropriate remediation:
      - high_cpu       → Scale pod replicas (reduce CPU load)
      - memory_spike   → Clear unused memory / flush caches
      - service_timeout → Restart affected service pods

    Moves system_state back toward a healthy baseline and records the fix.
    """
    detected = detect_issues()

    if detected.issue_type is None:
        return {
            "metrics": {
                "cpu": system_state["cpu"],
                "memory": system_state["memory"],
                "status": system_state["status"],
            },
            "logs": system_state["error_logs"],
            "issue": None,
            "severity": None,
            "action": "No action needed — system is already healthy.",
            "status": "healthy",
        }

    action_taken = ""

    if detected.issue_type == "high_cpu":
        # Scale replicas: spread load → reduce CPU to safe range
        system_state["cpu"] = random.randint(20, 55)
        action_taken = "Scaled pod replicas — CPU load redistributed across additional nodes."

    elif detected.issue_type == "memory_spike":
        # Clear memory caches and unused allocations
        system_state["memory"] = random.randint(30, 60)
        action_taken = "Flushed memory caches and terminated idle containers — memory reclaimed."

    elif detected.issue_type == "service_timeout":
        # Restart timed-out pods; clear error logs
        system_state["error_logs"] = []
        action_taken = "Restarted timed-out pods — service mesh re-established."

    # If all issues resolved, mark system healthy
    re_check = detect_issues()
    if re_check.issue_type is None:
        system_state["status"] = "healthy"

    # Record the fix in history
    record_incident(event_type="auto_fix_applied", detail=action_taken)

    return {
        "metrics": {
            "cpu": system_state["cpu"],
            "memory": system_state["memory"],
            "status": system_state["status"],
        },
        "logs": system_state["error_logs"],
        "issue": re_check.issue_type,
        "severity": re_check.severity,
        "action": action_taken,
        "status": "recovered" if system_state["status"] == "healthy" else "partially_fixed",
    }


# ─────────────────────────────────────────────
# GET /history — Incident History
# ─────────────────────────────────────────────
@app.get("/history", tags=["Monitoring"])
def get_history():
    """
    Return the last 5 incidents and fixes with timestamps.
    Newest entries appear first.
    """
    return {
        "history": list(incident_history),
        "total_recorded": len(incident_history),
        "status": "ok",
    }


# ─────────────────────────────────────────────
# POST /reset — Reset System to Healthy Baseline
# (Useful for demo resets between presentations)
# ─────────────────────────────────────────────
@app.post("/reset", tags=["Simulation"])
def reset_system():
    """
    Reset the global system_state back to healthy defaults.
    Clears all error logs and incident history.
    Useful for live demos.
    """
    system_state["cpu"] = 30
    system_state["memory"] = 40
    system_state["status"] = "healthy"
    system_state["error_logs"] = []
    incident_history.clear()

    return {
        "metrics": {
            "cpu": system_state["cpu"],
            "memory": system_state["memory"],
            "status": system_state["status"],
        },
        "logs": [],
        "issue": None,
        "severity": None,
        "action": "System reset to healthy baseline. History cleared.",
        "status": "healthy",
    }
