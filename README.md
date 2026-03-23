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

| Layer | Tech |
|-------|------|
| Backend | FastAPI, Uvicorn, Pydantic, Python 3.10 |
| Frontend | React 18, Vite 8, Tailwind CSS v4 |
| AI | OpenAI API (gpt-3.5-turbo) |

## Quick Start

**Backend:**
```bash
cd backend
./venv/bin/uvicorn main:app --reload --port 8000
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

*Built for a hackathon — clarity and demo-ability first.*