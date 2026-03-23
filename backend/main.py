from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from state import system_state, incident_history
from engines.detection import detect_issues
from engines.simulation import run_simulation, run_degradation
from engines.remediation import execute_fix

app = FastAPI(
    title="KubeAid API",
    description="Advanced AI-Powered Self-Healing Kubernetes Simulator",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
def root():
    return {"service": "KubeAid", "version": "3.0.0", "status": "running"}

@app.get("/status", tags=["Monitoring"])
def get_status():
    # Fluctuate perfectly healthy CPU to look alive
    if system_state["status"] == "healthy":
        import random
        system_state["cpu"] = random.randint(28, 35)
        
    detected = detect_issues()
    return {
        "metrics": {"cpu": system_state["cpu"], "memory": system_state["memory"], "status": system_state["status"]},
        "logs": system_state["error_logs"],
        "issue": detected.issue_type,
        "severity": detected.severity,
        "action": None,
        "status": "ok",
        "confidence": detected.confidence
    }

@app.post("/simulate", tags=["Simulation"])
def simulate_failure(type: Optional[str] = None):
    return run_simulation(type)

@app.post("/simulate/degradation", tags=["Simulation"])
def simulate_degradation():
    return run_degradation()

@app.post("/fix", tags=["Remediation"])
def auto_fix():
    return execute_fix()

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
    system_state["predictive_warning"] = False
    incident_history.clear()
    
    return {
        "metrics": {"cpu": 30, "memory": 40, "status": "healthy"},
        "logs": [],
        "issue": None,
        "severity": None,
        "action": "System reset to healthy baseline.",
        "status": "healthy",
    }