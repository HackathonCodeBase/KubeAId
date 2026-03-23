# KubeAid 🚀 — AI-Powered Self-Healing Kubernetes Backend

A FastAPI backend that simulates cloud infrastructure failures and demonstrates an autonomous **Detect → Diagnose → Fix → Recover** workflow for Kubernetes environments.

---

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the server
uvicorn main:app --reload --port 8000
```

Interactive API docs available at: **http://localhost:8000/docs**

---

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET`  | `/` | Health check — confirms API is running |
| `GET`  | `/status` | Current metrics, logs, detected issue & severity |
| `POST` | `/simulate` | Randomly inject a failure (CPU / Memory / Timeout) |
| `POST` | `/fix` | Auto-fix the detected issue |
| `GET`  | `/history` | Last 5 incidents & fixes with timestamps |
| `POST` | `/reset` | Reset system to healthy defaults (demo utility) |

---

## Workflow

### 1. Simulate a Failure
```bash
curl -X POST http://localhost:8000/simulate
```
Randomly injects one of:
- **High CPU** — spikes CPU > 85%
- **Memory Spike** — spikes memory > 80%
- **Service Timeout** — populates error logs with pod/service errors

### 2. Check Status
```bash
curl http://localhost:8000/status
```
Returns live metrics, error logs, detected issue type, and severity.

### 3. Auto-Fix
```bash
curl -X POST http://localhost:8000/fix
```
Applies the appropriate remediation:
- High CPU → scale pod replicas
- Memory spike → flush memory caches
- Timeouts → restart affected pods

### 4. View History
```bash
curl http://localhost:8000/history
```
Returns the last 5 incidents and fixes with UTC timestamps.

---

## Response Format

All endpoints return consistent JSON:

```json
{
  "metrics": { "cpu": 30, "memory": 40, "status": "healthy" },
  "logs": [],
  "issue": null,
  "severity": null,
  "action": null,
  "status": "ok"
}
```

---

## Detection Thresholds

| Metric | Threshold | Issue Type |
|--------|-----------|------------|
| CPU | > 80% | `high_cpu` |
| Memory | > 75% | `memory_spike` |
| Error logs | Any present | `service_timeout` |

**Severity** is determined by number of active issues:
- 1 issue → `low` (or `high` if metric is extreme)
- 2 issues → `medium`
- 3 issues → `high`

---

## Project Structure

```
KubeAid/
├── main.py           # FastAPI app — all endpoints, state, and engines
├── requirements.txt  # Python dependencies
└── README.md         # This file
```

---

*Built for hackathon demo — clarity and extensibility first.*
