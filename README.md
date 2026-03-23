# KubeAid

**AI-Powered Self-Healing Kubernetes Environment**

KubeAid simulates cloud infrastructure failures and autonomously detects, diagnoses, fixes, and recovers from them — demonstrating the full **Detect → Diagnose → Fix → Recover** workflow.

---

## Project Structure

```
KubeAid/
├── backend/    ← FastAPI REST API + simulation engine
└── frontend/   ← React dashboard + AI diagnosis UI
```

## Tech Stack

| Layer    | Tech                                    |
| -------- | --------------------------------------- |
| Backend  | FastAPI, Uvicorn, Pydantic, Python 3.10 |
| Frontend | React 18, Vite 8, Tailwind CSS v4       |
| AI       | OpenAI API (gpt-3.5-turbo)              |

## Quick Start

**Backend (Mac/Linux):**

```bash
cd backend
./venv/bin/uvicorn main:app --reload --port 8000
```

**Backend (Windows CMD/Powershell):**

```powershell
cd backend
venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install && npm run dev
```

Dashboard → **http://localhost:5173**  
API Docs → **http://localhost:8000/docs**

## Demo Flow

1. **Simulate Failure** — injects random CPU / Memory / Timeout failure
2. **AI Diagnosis** — auto-triggers, shows root cause and recommended fix
3. **Auto Fix** — remediates the issue and recovers the system
4. **Reset** — clears state for the next demo round

---

## 🧠 What KubeAid Adds (The Real Value)

**1. Intelligent Failure Diagnosis**

- _Kubernetes:_ "Pod crashed → restart it"
- _KubeAid:_ Detects _why_ it crashed (Memory leak, CrashLoopBackOff, Config error, Image issue) and moves from reaction to understanding.

**2. Smart Decision Engine**

- _Kubernetes:_ Follows fixed rules.
- _KubeAid:_ Chooses the best action dynamically (Restart pod, Scale replicas, Rollback deployment, Switch node). It acts as the brain for the cluster.

**3. Observability & Pattern Detection**

- _Kubernetes:_ Shows metrics via external tools.
- _KubeAid:_ Tracks exact anomaly patterns and state over time, enabling predictive healing workflows.

**4. Predictive Incident Simulation (V3 feature)**

- Simulates creeping degradation (e.g., slow memory leaks) before they crash.
- AI predicts the failure curve and executes **Pre-emptive Scaling** before end-users are ever affected.

**5. Reinforcement Learning Matrix (V3 feature)**

- The Auto-Fix engine has dynamic confidence scores.
- If a specific remediation strategy fails, KubeAid tracks the penalty and dynamically selects an alternative strategy on the next pass.
- _Low:_ Ignore / Log / Monitor
- _Medium:_ Restart / Flush / Scale
- _High:_ Rollback / Switch Node / Alert

---

_Built for a hackathon — clarity, demo-ability, and intelligence first._
