# KubeAid — Frontend

React dashboard for the KubeAid AI-powered self-healing Kubernetes simulator.

## Stack
- **React 18** + **Vite 8**
- **Tailwind CSS v4**
- **OpenAI API** (gpt-3.5-turbo) with rule-based fallback

## Setup

```bash
npm install
cp .env.example .env      # add your VITE_OPENAI_API_KEY
npm run dev               # http://localhost:5173
```

> Backend must be running on port 8000. Vite proxies all API calls automatically.

## Components

| File | Purpose |
|------|---------|
| `App.jsx` | Root — state, API polling, OpenAI calls |
| `Header.jsx` | Sticky nav with live system status |
| `SystemStatusCard.jsx` | OK / ERR display with issue tags |
| `MetricsPanel.jsx` | CPU & Memory bars + history chart |
| `AIDiagnosisPanel.jsx` | Root cause, fix, reasoning from AI |
| `ActionPanel.jsx` | Simulate / Auto Fix / Reset buttons + logs |

## Demo Flow

1. **Simulate Failure** → injects random CPU/Memory/Timeout failure
2. **AI Diagnosis** → auto-triggers and shows root cause + fix
3. **Auto Fix** → remediates the issue, system recovers
4. **Reset** → back to baseline for next demo round
