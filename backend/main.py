import json
import os
import urllib.error
import urllib.request
import requests
import openai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from state import system_state, incident_history
from engines.detection import detect_issues
from engines.simulation import run_simulation, run_degradation
from engines.remediation import execute_fix


class AIDiagnosisRequest(BaseModel):
    issue: str
    metrics: dict
    logs: List[str] = []
    severity: Optional[str] = None

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


@app.post("/ai/diagnose", tags=["AI"])
def ai_diagnose(request: AIDiagnosisRequest):
    if not request.issue or not request.metrics:
        raise HTTPException(status_code=400, detail="issue and metrics are required")

    google_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    # Helper: read frontend .env if backend env not set
    if not google_key or not openai_key:
        frontend_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", ".env")
        if os.path.exists(frontend_env):
            with open(frontend_env, "r", encoding="utf-8") as f:
                for line in f:
                    if "=" in line and not line.strip().startswith("#"):
                        name, val = line.strip().split("=", 1)
                        val = val.strip()
                        if name == "VITE_GEMINI_API_KEY" and val and not google_key:
                            google_key = val
                        if name == "VITE_OPENAI_API_KEY" and val and not openai_key:
                            openai_key = val

    if not google_key and not openai_key:
        return {
            "cause": f"Issue: {request.issue}. CPU: {request.metrics['cpu']}%, Memory: {request.metrics['memory']}%.",
            "fix": "Fallback: restart critical pods and re-balance resources.",
            "reasoning": "Rule-based fallback (no AI key).",
        }

    model = "text-bison-001"
    example_schema = '{"cause":"...","fix":"...","reasoning":"..."}'
    prompt = (
        f"You are a Kubernetes SRE AI. Given this system state, respond ONLY with valid JSON:\n"
        f"CPU: {request.metrics.get('cpu', '?')}%, Memory: {request.metrics.get('memory', '?')}%, Status: {request.metrics.get('status', 'unknown')}\n"
        f"Issue: {request.issue}, Severity: {request.severity or 'unknown'}\n"
        f"Logs: {'; '.join(request.logs or []) or 'none'}\n\n"
        f"{example_schema}"
    )

    if google_key:
        url = f"https://generativelanguage.googleapis.com/v1beta2/models/{model}:generate?key={google_key}"
        body = {
            "prompt": {"text": prompt},
            "temperature": 0.3,
            "max_output_tokens": 300,
            "candidate_count": 1,
        }
        try:
            resp = requests.post(url, json=body, timeout=20)
            print(f"[Google] Status: {resp.status_code}")
            if resp.ok:
                data = resp.json()
                candidate_text = data.get("candidates", [{}])[0].get("output")
                if candidate_text:
                    try:
                        parsed = json.loads(candidate_text)
                        if parsed.get("cause") and parsed.get("fix") and parsed.get("reasoning"):
                            print("[Google] Success!")
                            return parsed
                    except json.JSONDecodeError:
                        print("[Google] JSON parse failed")
        except Exception as e:
            print(f"[Google] Exception: {str(e)}")

    if openai_key:
        try:
            client = openai.OpenAI(api_key=openai_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.3,
            )
            text_output = response.choices[0].message.content.strip()
            print(f"[OpenAI] Got response: {text_output[:100]}")
            try:
                parsed = json.loads(text_output)
                if parsed.get("cause") and parsed.get("fix") and parsed.get("reasoning"):
                    print("[OpenAI] Success!")
                    return parsed
            except json.JSONDecodeError:
                print("[OpenAI] JSON parse failed")
        except Exception as e:
            print(f"[OpenAI] Exception: {str(e)}")


    # Final fallback: intelligent rule-based diagnosis
    return generate_intelligent_fallback(request.issue, request.metrics, request.severity, request.logs)


def generate_intelligent_fallback(issue, metrics, severity, logs):
    """Generate contextual, AI-like diagnostic responses when providers fail."""
    cpu = metrics.get("cpu", 0)
    memory = metrics.get("memory", 0)
    status = metrics.get("status", "unknown")
    
    # Normalize issue type
    issue_lower = issue.lower() if issue else ""
    
    # High CPU scenarios
    if "cpu" in issue_lower or cpu > 80:
        if cpu > 90:
            return {
                "cause": f"Runaway process detected. CPU surge to {cpu}% indicates a workload stuck in infinite loop or resource-intensive operation. Process not responding to normal scheduling.",
                "fix": "Immediately scale horizontally by deploying additional pod replicas to distribute load. If sustained, gracefully terminate the offending pod to allow Kubernetes to restart it with fresh resources.",
                "reasoning": f"Critical CPU spike ({cpu}%) suggests compute-bound workload. Horizontal scaling + pod restart is optimal recovery strategy to maintain availability.",
            }
        else:
            return {
                "cause": f"Elevated CPU usage at {cpu}% detected. Pod is consuming more resources than baseline. Likely caused by index rebuild, GC pause, or suboptimal query.",
                "fix": "Apply pod resource requests/limits to enforce fair scheduling. Consider HPA (Horizontal Pod Autoscaler) to automatically scale based on CPU metrics threshold.",
                "reasoning": f"Moderate CPU elevation ({cpu}%) suggests scalability challenge. Auto-scaling with proper resource quotas prevents cascading failures.",
            }
    
    # High Memory scenarios
    elif "memory" in issue_lower or memory > 80:
        if memory > 90:
            return {
                "cause": f"Memory exhaustion imminent. Pod using {memory}% of available heap. OOM killer may trigger without intervention, causing pod eviction.",
                "fix": "Increase memory limits in pod spec. Profile application for memory leaks (check for unreleased objects). Restart pod to reclaim memory if leak suspected.",
                "reasoning": f"Critical memory pressure ({memory}%) requires immediate action. Pod will be killed by kubelet if memory exceeds limit.",
            }
        else:
            return {
                "cause": f"Memory usage at {memory}% indicates potential memory leak or cache bloat. Application retaining references longer than necessary.",
                "fix": "Configure memory requests/limits appropriately. Enable pod memory monitoring via metrics-server. Add liveness probe to auto-restart if memory grows unbounded.",
                "reasoning": f"Sustained high memory ({memory}%) suggests application-level issue. Proper resource limits + monitoring enables auto-healing.",
            }
    
    # Crashed pod scenarios
    elif "crash" in issue_lower or "restart" in issue_lower or status == "crashed":
        if logs and len(logs) > 0:
            return {
                "cause": f"Pod repeatedly crashing. Logs indicate: {logs[0][:80]}. Application startup dependency missing or configuration invalid.",
                "fix": "Verify ConfigMap/Secret mounting is correct. Check database connectivity. Review application startup logs for dependency errors.",
                "reasoning": "Crash loop suggests config or dependency issue. Fix root cause in entrypoint before pod enters running state.",
            }
        else:
            return {
                "cause": "Pod in crash loop. Likely missing environment variable, configuration, or startup dependency.",
                "fix": "Inspect pod events with 'kubectl describe pod'. Review ConfigMap and Secret mounts. Verify database/service discovery is available.",
                "reasoning": "Repeated crashes indicate configuration or environment setup issue, not resource contention.",
            }
    
    # Degradation scenarios
    elif "degrad" in issue_lower or severity == "HIGH":
        return {
            "cause": f"System degradation detected. Performance baseline exceeded with CPU {cpu}% and Memory {memory}%. Cascading failure risk if load continues.",
            "fix": "Enable cluster autoscaling to add nodes. Trigger pod horizontal auto-scaling. Review slow queries and optimize hot paths.",
            "reasoning": f"Degradation pattern indicates convergence toward critical state. Proactive scaling + optimization prevents full outage.",
        }
    
    # Network/connectivity scenarios
    elif "connect" in issue_lower or "timeout" in issue_lower or "network" in issue_lower:
        return {
            "cause": "Network connectivity issue detected. Pod unable to reach service endpoint. Likely DNS resolution failure or service mesh misconfiguration.",
            "fix": "Verify Service DNS name resolves correctly. Check NetworkPolicy allows egress to target service. Review CoreDNS pod status.",
            "reasoning": "Connection timeouts indicate infrastructure layer issue. Validate DNS and network policies before restarting applications.",
        }
    
    # Default fallback for unknown issues
    else:
        return {
            "cause": f"Anomaly detected: {issue}. System metrics show CPU {cpu}%, Memory {memory}%. Root cause requires deeper investigation.",
            "fix": "Collect full diagnostics: pod logs, events, resource requests/limits. Scale up affected workload if resource-constrained. Monitor metrics for pattern.",
            "reasoning": f"Unknown issue pattern with metrics CPU={cpu}%, Mem={memory}%. Recommend horizontal scaling as immediate mitigation while investigating root cause.",
        }
