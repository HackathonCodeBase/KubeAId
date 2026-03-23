import random
from datetime import datetime
from collections import deque
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="KubeAid API",
    description="AI-Powered Self-Healing Kubernetes Simulator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global system state
system_state: dict = {
    "cpu": 30,
    "memory": 40,
    "status": "healthy",
    "error_logs": [],
}

# Rolling incident history (last 5)
incident_history: deque = deque(maxlen=5)


class Metrics(BaseModel):
    cpu: int
    memory: int
    status: str


class IssueDetail(BaseModel):
    issue_type: Optional[str] = None
    severity: Optional[str] = None


def detect_issues() -> IssueDetail:
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

    primary = issues[0]
    if len(issues) >= 3:
        severity = "high"
    elif len(issues) == 2:
        severity = "medium"
    elif primary == "high_cpu" and cpu > 90:
        severity = "high"
    elif primary == "memory_spike" and memory > 88:
        severity = "high"
    else:
        severity = "low"

    return IssueDetail(issue_type=primary, severity=severity)


def record_incident(event_type: str, detail: str) -> None:
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


@app.get("/", tags=["Health"])
def root():
    return {"service": "KubeAid", "version": "1.0.0", "status": "running"}


@app.get("/status", tags=["Monitoring"])
def get_status():
    detected = detect_issues()
    return {
        "metrics": {"cpu": system_state["cpu"], "memory": system_state["memory"], "status": system_state["status"]},
        "logs": system_state["error_logs"],
        "issue": detected.issue_type,
        "severity": detected.severity,
        "action": None,
        "status": "ok",
    }


@app.post("/simulate", tags=["Simulation"])
def simulate_failure():
    failure_type = random.choice(["high_cpu", "memory_spike", "service_timeout"])

    if failure_type == "high_cpu":
        system_state["cpu"] = random.randint(86, 98)
        system_state["status"] = "critical"
        detail = f"CPU spiked to {system_state['cpu']}%"
    elif failure_type == "memory_spike":
        system_state["memory"] = random.randint(81, 96)
        system_state["status"] = "critical"
        detail = f"Memory spiked to {system_state['memory']}%"
    else:
        timeout_messages = [
            "ERR: Pod 'api-server-7f4d' timed out after 30s",
            "ERR: Service 'auth-service' unreachable — connection refused",
            "ERR: Health-check failed on node 'worker-node-3'",
        ]
        system_state["error_logs"] = random.sample(timeout_messages, k=random.randint(1, len(timeout_messages)))
        system_state["status"] = "critical"
        detail = f"Service timeout injected — {len(system_state['error_logs'])} error(s)"

    record_incident("failure_injected", detail)
    detected = detect_issues()
    return {
        "metrics": {"cpu": system_state["cpu"], "memory": system_state["memory"], "status": system_state["status"]},
        "logs": system_state["error_logs"],
        "issue": detected.issue_type,
        "severity": detected.severity,
        "action": None,
        "status": "simulated",
        "failure_injected": failure_type,
    }


@app.post("/fix", tags=["Remediation"])
def auto_fix():
    detected = detect_issues()

    if detected.issue_type is None:
        return {
            "metrics": {"cpu": system_state["cpu"], "memory": system_state["memory"], "status": system_state["status"]},
            "logs": system_state["error_logs"],
            "issue": None,
            "severity": None,
            "action": "No action needed — system is already healthy.",
            "status": "healthy",
        }

    if detected.issue_type == "high_cpu":
        system_state["cpu"] = random.randint(20, 55)
        action_taken = "Scaled pod replicas — CPU load redistributed."
    elif detected.issue_type == "memory_spike":
        system_state["memory"] = random.randint(30, 60)
        action_taken = "Flushed memory caches — memory reclaimed."
    else:
        system_state["error_logs"] = []
        action_taken = "Restarted timed-out pods — service restored."

    re_check = detect_issues()
    if re_check.issue_type is None:
        system_state["status"] = "healthy"

    record_incident("auto_fix_applied", action_taken)
    return {
        "metrics": {"cpu": system_state["cpu"], "memory": system_state["memory"], "status": system_state["status"]},
        "logs": system_state["error_logs"],
        "issue": re_check.issue_type,
        "severity": re_check.severity,
        "action": action_taken,
        "status": "recovered" if system_state["status"] == "healthy" else "partially_fixed",
    }


@app.get("/history", tags=["Monitoring"])
def get_history():
    return {"history": list(incident_history), "total_recorded": len(incident_history), "status": "ok"}


@app.post("/reset", tags=["Simulation"])
def reset_system():
    system_state["cpu"] = 30
    system_state["memory"] = 40
    system_state["status"] = "healthy"
    system_state["error_logs"] = []
    incident_history.clear()
    return {
        "metrics": {"cpu": 30, "memory": 40, "status": "healthy"},
        "logs": [],
        "issue": None,
        "severity": None,
        "action": "System reset to healthy baseline.",
        "status": "healthy",
    }
