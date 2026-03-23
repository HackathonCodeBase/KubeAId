# KubeAid — Backend

FastAPI backend simulating an AI-powered self-healing Kubernetes environment.

## Stack
- **FastAPI** + **Uvicorn**
- **Pydantic v2**
- **Python 3.10**

## Setup

```bash
cd backend
./venv/bin/uvicorn main:app --reload --port 8000
```

Swagger docs at **http://localhost:8000/docs**

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/status` | Current metrics, issue, severity |
| `POST` | `/simulate` | Inject random failure |
| `POST` | `/fix` | Auto-remediate detected issue |
| `GET` | `/history` | Last 5 incidents with timestamps |
| `POST` | `/reset` | Reset to healthy defaults |

## Failure Types

| Type | Trigger | Fix Action |
|------|---------|------------|
| `high_cpu` | CPU > 85% | Scale pod replicas |
| `memory_spike` | Memory > 80% | Flush memory caches |
| `service_timeout` | Error logs present | Restart pods |

## Detection Thresholds

- CPU > 80% → `high_cpu`
- Memory > 75% → `memory_spike`
- Any error logs → `service_timeout`

Severity: `low` (1 issue) → `medium` (2) → `high` (3 or extreme values)
