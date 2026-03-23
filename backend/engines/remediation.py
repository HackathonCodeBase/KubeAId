import random

from state import system_state, learning_matrix, record_incident
from engines.detection import detect_issues

def execute_fix():
    detected = detect_issues()

    if detected.issue_type is None:
        return {
            "metrics": {"cpu": system_state["cpu"], "memory": system_state["memory"], "status": system_state["status"]},
            "logs": system_state["error_logs"],
            "issue": None,
            "severity": None,
            "action": "No action needed — system is already healthy.",
            "status": "healthy",
            "confidence": None
        }

    # RL Decision Selection
    primary = detected.issue_type
    
    if primary == "predictive_degradation":
        strategy = "pre_emptive_scale"
        confidence = 0.88
        action_taken = "Pre-emptive scaling triggered before critical failure."
        system_state["cpu"] = 35
        system_state["memory"] = 40
        system_state["predictive_warning"] = False
        system_state["status"] = "healthy"
        system_state["error_logs"] = []
        system_state["anomaly"] = None
    elif detected.severity == "low":
        strategy = "ignore"
        confidence = 1.0
        action_taken = f"Logged anomaly '{detected.issue_type}'. Ignored actively."
        system_state["status"] = "healthy"
        system_state["anomaly"] = None
        system_state["error_logs"] = []
    else:
        # RL Lookup
        rl_data = learning_matrix.get(primary, {"strategies": ["default_fix"], "weights": [1.0]})
        strategy = random.choices(rl_data["strategies"], weights=rl_data["weights"])[0]
        confidence = rl_data["weights"][rl_data["strategies"].index(strategy)]
        
        # Simulated Failure of Strategy (20% chance if confidence < 0.9)
        fix_failed = random.random() > 0.8 and confidence < 0.9
        
        if fix_failed:
            action_taken = f"Fix Strategy '{strategy}' FAILED. Tracking RL penalty."
            record_incident("fix_failed", action_taken)
            return {
                "metrics": {"cpu": system_state["cpu"], "memory": system_state["memory"], "status": system_state["status"]},
                "logs": system_state["error_logs"],
                "issue": detected.issue_type,
                "severity": detected.severity,
                "action": action_taken,
                "status": "critical",
                "confidence": confidence
            }
        
        if strategy == "scale_replicas":
            system_state["cpu"] = random.randint(20, 55)
            action_taken = "Scaled pod replicas horizontally."
        elif strategy == "flush_cache":
            system_state["memory"] = random.randint(30, 60)
            action_taken = "Flushed memory caches."
        elif strategy == "restart_leaking_pod":
            system_state["memory"] = 45
            action_taken = "Restarted leaking pod."
        elif strategy == "rollback_deployment":
            action_taken = "Rolled back deployment to previous stable ReplicaSet."
        elif strategy == "revert_configmap":
            action_taken = "Reverted ConfigMap to last known good state."
        elif strategy == "fallback_registry":
            action_taken = "Switched to fallback replica registry."
        elif strategy == "shift_traffic":
            action_taken = "Shifted traffic to secondary nodes."
        else:
            action_taken = f"Executed generic fallback strategy: {strategy}."
            system_state["cpu"] = 30
            system_state["memory"] = 40

        # Clear anomalies post-fix
        system_state["error_logs"] = []
        system_state["anomaly"] = None
        system_state["consecutive_failures"] = 0

    re_check = detect_issues()
    if re_check.issue_type is None:
        system_state["status"] = "healthy"

    record_incident("auto_fix_applied", f"{action_taken} (Confidence: {confidence:.2f})")
    
    return {
        "metrics": {"cpu": system_state["cpu"], "memory": system_state["memory"], "status": system_state["status"]},
        "logs": system_state["error_logs"],
        "issue": re_check.issue_type,
        "severity": re_check.severity,
        "action": action_taken,
        "status": "recovered" if system_state["status"] == "healthy" else "partially_fixed",
        "confidence": confidence
    }
