import random
from typing import Optional

from state import system_state, record_incident
from engines.detection import detect_issues

def run_simulation(type: Optional[str] = None):
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
    system_state["error_logs"] = [] 
    system_state["predictive_warning"] = False

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
        system_state["error_logs"] = ["ERR: Pod 'payment-svc-9x2b' CrashLoopBackOff", "WARN: Restart retries exceeded (6/6)"]
        detail = "Critical Pod entered CrashLoopBackOff"
    elif failure_type == "config_error":
        system_state["error_logs"] = ["ERR: Invalid YAML in ConfigMap 'app-config'"]
        detail = "Pod failed to start due to ConfigMap error"
    elif failure_type == "image_pull_error":
        system_state["error_logs"] = ["ERR: ImagePullBackOff — registry 'docker-local' offline"]
        detail = "Node cannot pull container image (ImagePullBackOff)"
    else: 
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

def run_degradation():
    system_state["cpu"] = min(99, system_state["cpu"] + random.randint(5, 12))
    system_state["memory"] = min(99, system_state["memory"] + random.randint(4, 10))
    system_state["predictive_warning"] = True
    system_state["status"] = "warning"
    
    record_incident("degradation_simulated", f"Resource creep detected. CPU: {system_state['cpu']}%, RAM: {system_state['memory']}%")
    detected = detect_issues()
    
    return {
        "metrics": {"cpu": system_state["cpu"], "memory": system_state["memory"], "status": system_state["status"]},
        "logs": system_state["error_logs"],
        "issue": detected.issue_type,
        "severity": detected.severity,
        "action": None,
        "status": "degraded",
    }
