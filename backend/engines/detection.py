from state import system_state
from models import IssueDetail

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

    if system_state.get("predictive_warning"):
        return IssueDetail(issue_type="predictive_degradation", severity="pre_emptive", confidence=0.85)

    if not issues:
        return IssueDetail(issue_type=None, severity=None, confidence=None)

    primary = issues[0]

    if primary in ["crashloopbackoff", "config_error"]:
        severity = "high"
    elif primary in ["service_timeout", "image_pull_error", "memory_leak"]:
        severity = "medium"
    elif primary == "high_cpu":
        severity = "high" if cpu >= 90 else "medium"
    elif primary == "memory_spike":
        severity = "high" if memory >= 88 else "medium"
    else:
        severity = "low"

    return IssueDetail(issue_type=primary, severity=severity, confidence=0.95)
