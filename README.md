# AI Interview Preparation Platform

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **AI**: Google Gemini 1.5 Flash
- **Auth**: JWT

## Features
- User Register / Login
- AI-generated mock interview questions
- Voice-to-text answers (Web Speech API)
- Per-question AI scoring & feedback
- Overall interview feedback & score
- Resume upload + AI topic suggestions
- Full interview history

---

## Setup

### 1. PostgreSQL
Create a database named `interview_prep`

### 2. Server
```bash
cd server
# Edit .env — set DATABASE_URL and GEMINI_API_KEY
npm install
npm run db:generate
npm run db:migrate    # enter migration name e.g. "init"
npm run dev
```

### 3. Client
```bash
cd client
npm install
npm run dev
```

App runs at: http://localhost:5173  
API runs at: http://localhost:5000

---

## Get Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Create API key (free tier available)
3. Paste in `server/.env` → `GEMINI_API_KEY`

## Environment Variables (server/.env)
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/interview_prep"
JWT_SECRET="change_this_to_random_string"
GEMINI_API_KEY="your_key_here"
PORT=5000
CLIENT_URL="http://localhost:5173"
```
