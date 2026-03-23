from collections import deque
from datetime import datetime

# Global system state
system_state = {
    "cpu": 30,
    "memory": 40,
    "status": "healthy",
    "error_logs": [],
    "anomaly": None,
    "consecutive_failures": 0,
    "predictive_warning": False, # V3 metric
}

incident_history = deque(maxlen=5)

# Reinforcement Learning Fix Matrix
learning_matrix = {
    "high_cpu": {"strategies": ["scale_replicas", "restart_pods"], "weights": [0.9, 0.1]},
    "memory_spike": {"strategies": ["flush_cache", "restart_pods"], "weights": [0.8, 0.2]},
    "memory_leak": {"strategies": ["restart_leaking_pod", "update_limits"], "weights": [0.7, 0.3]},
    "crashloopbackoff": {"strategies": ["rollback_deployment", "evict_pod"], "weights": [0.85, 0.15]},
    "config_error": {"strategies": ["revert_configmap", "restart_pods"], "weights": [0.95, 0.05]},
    "image_pull_error": {"strategies": ["fallback_registry", "restart_kubelet"], "weights": [0.9, 0.1]},
    "service_timeout": {"strategies": ["shift_traffic", "restart_pods"], "weights": [0.8, 0.2]},
}

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
