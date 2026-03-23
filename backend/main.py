import random
from datetime import datetime
from collections import deque
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="KubeAid API",
    description="Advanced AI-Powered Self-Healing Kubernetes Simulator",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Advanced system state with pattern tracking
system_state: dict = {
    "cpu": 30,
    "memory": 40,
    "status": "healthy",
    "error_logs": [],
    "anomaly": None,
    "consecutive_failures": 0,
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
    anomaly = system_state["anomaly"]

    issues = []
    if anomaly:
        issues.append(anomaly)
    elif cpu > 80:
        issues.append("high_cpu")
    elif memory > 75:
        issues.append("memory_spike")
    elif logs:
        issues.append("service_timeout")

    if not issues:
        return IssueDetail(issue_type=None, severity=None)

    primary = issues[0]

    # Severity-Based Response Classification
    if primary in ["crashloopbackoff", "config_error"]:
        severity = "high"
    elif primary in ["service_timeout", "image_pull_error", "memory_leak"]:
        severity = "medium"
    elif primary == "high_cpu" and cpu > 95:
        severity = "high"
    elif primary == "memory_spike" and memory > 90:
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
    return {"service": "KubeAid", "version": "2.0.0", "status": "running"}


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
def simulate_failure(type: Optional[str] = None):
    # 7 diverse failure types for Intelligent Diagnosis
    valid_types = [
        "high_cpu", "memory_spike", "service_timeout",
        "crashloopbackoff", "config_error", "image_pull_error", "memory_leak"
    ]
    
    if type in valid_types:
        failure_type = type
    else:
        failure_type = random.choice(valid_types)


    system_state["consecutive_failures"] += 1
    system_state["status"] = "critical"
    system_state["anomaly"] = failure_type
    system_state["error_logs"] = [] # Clear leftover logs from previous failures

    if failure_type == "high_cpu":
        system_state["cpu"] = random.randint(86, 99)
        detail = f"CPU spiked to {system_state['cpu']}%"
    elif failure_type == "memory_spike":
        system_state["memory"] = random.randint(81, 98)
        detail = f"Sudden memory spike to {system_state['memory']}%"
    elif failure_type == "memory_leak":
        system_state["memory"] = 99
        system_state["error_logs"] = ["WARN: OOMKilled pod 'cache-redis'"]
        detail = "Memory leak detected (OOMKilled) over last 10m"
    elif failure_type == "crashloopbackoff":
        system_state["error_logs"] = [
            "ERR: Pod 'payment-svc-9x2b' CrashLoopBackOff", 
            "WARN: Restart retries exceeded (6/6)"
        ]
        detail = "Critical Pod entered CrashLoopBackOff"
    elif failure_type == "config_error":
        system_state["error_logs"] = ["ERR: Invalid YAML in ConfigMap 'app-config'"]
        detail = "Pod failed to start due to ConfigMap error"
    elif failure_type == "image_pull_error":
        system_state["error_logs"] = ["ERR: ImagePullBackOff — registry 'docker-local' offline"]
        detail = "Node cannot pull container image (ImagePullBackOff)"
    else:  # service_timeout
        system_state["error_logs"] = ["ERR: Service 'auth-service' unreachable (504 Gateway Timeout)"]
        detail = "Service timeout injected — downstream unresponsive"

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

    # Smart Decision Engine (Severity & Issue Type Actions)
    if detected.severity == "low":
        action_taken = f"Logged anomaly '{detected.issue_type}' (Low Severity). Ignored actively."
        system_state["status"] = "healthy"
        system_state["anomaly"] = None
        system_state["error_logs"] = []

    elif detected.issue_type == "high_cpu":
        system_state["cpu"] = random.randint(20, 55)
        action_taken = "Scaled pod replicas horizontally. CPU load redistributed."
    elif detected.issue_type == "memory_spike":
        system_state["memory"] = random.randint(30, 60)
        action_taken = "Flushed memory caches and restarted idle containers."
    elif detected.issue_type == "memory_leak":
        system_state["memory"] = 45
        action_taken = "Restarted leaking pod and updated resource limits dynamically."
    elif detected.issue_type == "crashloopbackoff":
        action_taken = "Rolled back deployment to previous stable ReplicaSet."
    elif detected.issue_type == "config_error":
        action_taken = "Reverted ConfigMap to last known good state and restarted pods."
    elif detected.issue_type == "image_pull_error":
        action_taken = "Switched to fallback replica registry and deployed successfully."
    else: # service_timeout
        action_taken = "Restarted timed-out pods and shifted traffic to secondary node."

    # Clear anomalies post-fix
    if detected.severity != "low":
        system_state["error_logs"] = []
        system_state["anomaly"] = None
        system_state["consecutive_failures"] = 0

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
    system_state["anomaly"] = None
    system_state["consecutive_failures"] = 0
    incident_history.clear()
    
    return {
        "metrics": {"cpu": 30, "memory": 40, "status": "healthy"},
        "logs": [],
        "issue": None,
        "severity": None,
        "action": "System reset to healthy baseline.",
        "status": "healthy",
    }
    