# 🌿 ESG Trust Platform — Theme 7: Sustainability Data Trust, Governance & Assurance

A full-stack web application showcasing AI-powered ESG data trust capabilities.
**100% free to run** — uses Google Gemini free tier, no paid services required.

---

## 📁 Project Structure
```
esg-platform/
├── backend/          ← FastAPI Python backend
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/      ← API route handlers
│   └── services/     ← Gemini AI + Qdrant services
└── frontend/         ← React + Tailwind frontend
    ├── src/
    │   ├── pages/    ← All 7 screen pages
    │   ├── api/      ← API client
    │   └── App.jsx   ← Main app with sidebar nav
    └── package.json
```

---

## 🚀 QUICK START (Run Locally in 5 Minutes)

### STEP 1 — Install Prerequisites (first time only)
- Python 3.11: https://www.python.org/downloads/ (CHECK "Add to PATH")
- Node.js LTS: https://nodejs.org/
- VS Code: https://code.visualstudio.com/

---

### STEP 2 — Setup Backend

Open a terminal in VS Code and run:

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

Copy the env file:
```bash
copy .env.example .env         # Windows
# cp .env.example .env         # Mac/Linux
```

Run the backend:
```bash
uvicorn main:app --reload
```

✅ Backend running at: http://localhost:8000
✅ API docs at: http://localhost:8000/docs

---

### STEP 3 — Setup Frontend

Open a NEW terminal (keep backend running) and run:

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running at: http://localhost:3000

---

## 🤖 Add Gemini AI (Optional but Recommended)

The app works WITHOUT Gemini using smart mock responses.
To enable real AI:

1. Go to: https://aistudio.google.com/app/apikey
2. Create a free API key
3. Open `backend/.env`
4. Replace `your_gemini_api_key_here` with your actual key
5. Restart the backend

---

## 🖥️ Application Screens

| Screen | URL | Description |
|--------|-----|-------------|
| Dashboard | / | Trust scores, alerts, module overview |
| Data Lineage | /lineage | Visual flow diagram from source to report |
| AI Explainability | /explainability | Explain every AI decision + semantic search |
| Data Quality | /quality | Anomaly detection, traffic light status |
| Audit Trail | /audit | Timeline of all data changes |
| Supplier Portal | /suppliers | Supplier status, risk analysis |
| Reporting Hub | /reporting | CSRD/SEC report generation |

---

## 🌐 Hosting (Free)

- **Backend**: Deploy to https://render.com (free tier)
- **Frontend**: Deploy to https://vercel.com (free forever)
- See DEPLOYMENT.md for step-by-step hosting guide

---

## 💡 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python FastAPI |
| Frontend | React + Vite + Tailwind CSS |
| AI | Google Gemini 1.5 Flash (free tier) |
| Charts | Recharts |
| Icons | Lucide React |
| Hosting | Render + Vercel (free) |
