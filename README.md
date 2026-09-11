# GATE CS PYQ Practice Platform

A topic-wise previous-year-question practice platform for GATE CS, with mock tests
and progress tracking. Built for free-tier deployment.

## Architecture

```
Frontend (React + Vite + Tailwind)  --->  Backend (Node.js + Express)  --->  MongoDB Atlas
        |
        └── deployed on Vercel                    └── deployed on Render
```

- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Recharts (progress charts)
- **Backend**: Node.js, Express, Mongoose (MongoDB ODM), JWT auth, bcrypt
- **Database**: MongoDB Atlas (free M0 cluster)
- **Question ingestion**: Python script using `pdfplumber` to extract text from official
  GATE CS question papers (PDFs published by the conducting IIT each year), semi-automated
  tagging into subjects → chapters → questions, with manually written or AI-generated
  explanations (never scraped from third-party prep sites — see note below).
- **Deployment**: Vercel (frontend), Render (backend web service), MongoDB Atlas (DB)

## Why not scrape prep sites directly

GATE question *papers* themselves are released publicly by the IIT that conducts the
exam each year — using the raw questions from the official PDF is fine. But the
*explanations* on sites like ExamSIDE / GeeksforGeeks / GATE Overflow are original
copyrighted content owned by those sites. Copying them verbatim is a ToS/copyright
problem. Instead:
1. Extract question text + official answer key from the **official PDF**.
2. Write your own explanation per question (or generate a first draft with an LLM,
   then review/edit it yourself before publishing).

## Data Model (MongoDB collections)

- **users**: name, email, passwordHash, createdAt
- **subjects**: name (e.g. "Linear Algebra"), slug
- **chapters**: subjectId, name (e.g. "Eigenvalues and Eigenvectors"), slug
- **questions**: chapterId, subjectId, year, questionType (mcq/msq/nat), text,
  options[], correctAnswer, marks, negativeMarks, explanation, difficulty
- **mocktests**: title, questionIds[], durationMinutes, totalMarks
- **attempts**: userId, mockTestId (nullable for practice mode), answers[], score,
  startedAt, submittedAt
- **bookmarks**: userId, questionId

## MVP Feature Set (v1 — GATE CS only)

1. Browse questions by Subject → Chapter → Year, with full explanations
2. Practice mode: answer questions one at a time, instant feedback
3. Mock test mode: timed, full-length or subject-wise, auto-graded on submit
4. Progress dashboard: accuracy by chapter, attempts over time, weak-topic flags
5. Auth: signup/login (JWT), bookmarks tied to user account

## Folder Structure

```
gate-pyq-platform/
├── backend/
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express route handlers
│   ├── middleware/      # auth middleware
│   ├── scripts/         # PDF ingestion script
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Ingesting questions from an official GATE PDF
```bash
cd backend/scripts
pip install pdfplumber --break-system-packages
python parse_gate_pdf.py --input path/to/GATE_CS_2025.pdf --subject "Linear Algebra"
```
This prints extracted question blocks to the console for you to review and tag before
inserting into the DB — it's a semi-automated first pass, not a fully unattended
pipeline, since layout varies year to year and needs a human check.

## Deployment (all free tier)

1. Push `backend/` to a GitHub repo → connect to Render as a Web Service → set
   `MONGO_URI` and `JWT_SECRET` env vars.
2. Push `frontend/` to the same or another repo → connect to Vercel → set
   `VITE_API_URL` to your Render backend URL.
3. Create a free M0 cluster on MongoDB Atlas, whitelist Render's IP (or 0.0.0.0/0
   for simplicity on a portfolio project), get the connection string.
# gate-pyq-platform
