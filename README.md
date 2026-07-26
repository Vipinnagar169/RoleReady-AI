# 🚀 RoleReady AI — Production-Grade AI Career & Interview Preparation SaaS Platform

![RoleReady AI Banner](https://img.shields.io/badge/Platform-RoleReady%20AI-indigo?style=for-the-badge&logo=react)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20MongoDB%20%7C%20React%20%7C%20Groq%20AI-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**RoleReady AI** is an advanced, full-stack AI-powered Career & Interview Preparation SaaS platform engineered with a sleek Dark Mode + Glassmorphism UI aesthetic. It empowers job seekers and software engineers to benchmark their job readiness, analyze skill gaps against job descriptions, conduct interactive voice mock interviews, and generate tailored 7-day preparation roadmaps.

---

## 🌟 Core Working Features

### 1. 🎯 AI Job Strategy & Report Generator
- **Dynamic Candidate Benchmarking**: Calculates realistic match scores (40% – 95%) based on candidate profile vs. target job requirements.
- **Targeted Technical & Behavioral Questions**: Generates curated questions complete with recruiter intention and detailed model answers.
- **7-Day Actionable Preparation Roadmap**: Custom day-by-day learning schedule tailored to candidate skill gaps.

### 2. 🎙️ AI Voice Mock Interviewer
- **Interactive Speech-to-Text & Voice Synthesis**: Uses browser `SpeechRecognition` for candidate audio input and `SpeechSynthesis` for realistic AI interviewer voice responses.
- **Turn-by-Turn Dynamic Evaluation**: Real-time answer scoring (0-100), confidence ratings, and constructive improvement feedback.
- **Interactive Audio Controls**: Toggle question audio play/stop, automatic speech interruption handling, and pause-safe transcript accumulation.

### 3. 🧠 RAG & Semantic Skill Gap Analysis Engine
- **TF-IDF Chunking & Context Matching**: Matches candidate resume bullet points against job clauses using vector context retrieval.
- **Ground-Truth Feedback**: Identifies missing technical skills tagged with severity ratings (`Low`, `Medium`, `High`).

### 4. 📊 Analytics Dashboard & Skill Competency Radar
- **Readiness Metric Tracking**: Live overview of total interview reports and overall job readiness match percentage.
- **Interactive Skill Radar Chart**: Powered by `Chart.js` & `react-chartjs-2` visualizing 6 core engineering competencies (*Technical Skills, Soft Skills, Problem Solving, System Design, Experience Match, Domain Knowledge*).
- **Personalized Recommendations**: Strategic action items for interview preparation.

### 5. 🌐 AI Job URL Auto-Fetcher
- **Paste & Auto-Fetch**: Simply paste any job posting URL (LinkedIn / Indeed / Glassdoor).
- **AI Extraction**: Scrapes web content using Cheerio + Axios and extracts clean Job Titles and Responsibilities automatically using Groq Llama 3.3.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, SCSS, Chart.js, react-chartjs-2, Axios, React Router v8 |
| **Voice Engine** | Web Speech API (`SpeechRecognition` & `window.speechSynthesis`) |
| **Backend** | Node.js, Express.js, Mongoose (MongoDB Atlas), Cookie Parser, CORS, Multer |
| **AI & RAG** | Groq SDK (`groq-sdk`), Llama 3.3 70B, Custom TF-IDF Semantic RAG Engine |
| **Scraper** | Cheerio, Axios |
| **Authentication** | JWT (HttpOnly Cookie), bcryptjs, Token Blacklisting |

---

## 📁 Project Architecture

```
RoleReady-AI/
├── Backend/
│   ├── src/
│   │   ├── config/          # MongoDB database connection
│   │   ├── controllers/     # Auth, Interview, Voice & URL Fetcher controllers
│   │   ├── middlewares/     # JWT Auth & Multer file upload middlewares
│   │   ├── models/          # User, InterviewReport, Blacklist token schemas
│   │   ├── routes/          # Express route definitions
│   │   └── services/        # Groq AI, RAG semantic engine & URL scraper
│   ├── .env                 # Environment secrets
│   ├── package.json
│   └── server.js            # Express server entry point
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/        # Login, Register, Auth Context & Hooks
│   │   │   ├── dashboard/   # Analytics Dashboard & Skill Radar Chart
│   │   │   ├── interview/   # Home Page, Interview Strategy & Reports
│   │   │   └── voice/       # AI Voice Mock Interview Room
│   │   ├── app.routes.jsx   # Client routing
│   │   ├── main.jsx
│   │   └── style.scss       # Global CSS & SCSS styles
│   ├── index.html
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB connection URI
- Groq API Key (`GROQ_API_KEY_1`)

### 1. Setup Backend
```powershell
cd Backend
npm install
npm run dev
```

### 2. Setup Frontend
```powershell
cd Frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
