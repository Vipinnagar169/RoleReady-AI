# 🚀 RoleReady AI — Production-Grade AI Career & Interview Preparation SaaS Platform

![RoleReady AI Banner](https://img.shields.io/badge/Platform-RoleReady%20AI-indigo?style=for-the-badge&logo=react)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20MongoDB%20%7C%20React%20%7C%20Gemini%20AI-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**RoleReady AI** is an advanced, full-stack AI-powered Career & Interview Preparation SaaS platform engineered with a sleek Dark Mode + Glassmorphism UI aesthetic. It empowers job seekers and engineers to benchmark their job readiness, conduct interactive voice mock interviews, optimize ATS resumes in real time, and extract semantic skill gaps using Retrieval Augmented Generation (RAG).

---

## 🌟 Key Features

### 1. 🎙️ AI Voice Mock Interviewer
- **Interactive Speech-to-Text & Voice Synthesis**: Uses browser Web Speech API (`SpeechRecognition`) for candidate audio input and `SpeechSynthesis` for realistic AI interviewer voice responses.
- **Dynamic Multi-Turn Interviews**: Adaptive technical & behavioral rounds powered by Google Gemini AI.
- **Real-Time Evaluation**: Turn-by-turn confidence rating, response scoring (0-100), and instant improvement feedback.

### 2. 📄 ATS Resume Auto-Optimizer & Live PDF Builder
- **Target JD Alignment**: Tailors professional summary, core technical skills, and accomplishment bullet points.
- **Live WYSIWYG Editor**: Split-pane live document preview.
- **Selected File Indicator**: Displays file name and size badge (`📄 resume.pdf (0.45 MB)`) upon selecting a PDF.
- **1-Click ATS Export**: Instant PDF export ready for recruiter applications.

### 3. 📊 Analytics Dashboard & Skill Radar Chart
- **Overall Job Readiness Score (0-100%)**: Aggregated match score based on candidate profile vs. target job requirement.
- **Interactive Skill Radar Chart**: Powered by `Chart.js` & `react-chartjs-2` visualizing Technical, Soft Skills, System Design, Problem Solving, Experience, and Domain Knowledge.
- **Actionable Benchmarking**: Personalized progress metrics and recommended learning paths.

### 4. 🧠 RAG & Semantic Skill Gap Analysis Engine
- **TF-IDF Chunking & Similarity Analysis**: Eliminates AI hallucinations by matching candidate resume bullet points against job clauses using vector context retrieval.
- **Ground-Truth Feedback**: Identifies missing hard skills with severity ratings (`Low`, `Medium`, `High`).

### 5. 🌐 Job URL Auto-Fetcher & JD Extraction
- **Direct Job Post Parsing**: Simply paste any job posting URL (LinkedIn / Indeed / Glassdoor / Career Portals).
- **AI Extraction**: Scrapes web content using Cheerio + Axios and extracts clean Job Titles and Responsibilities automatically.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, SCSS, Chart.js, react-chartjs-2, Axios, React Router v8 |
| **Voice Engine** | Web Speech API (`webkitSpeechRecognition` & `window.speechSynthesis`) |
| **Backend** | Node.js, Express.js, Mongoose (MongoDB Atlas), Cookie Parser, CORS, Multer |
| **AI & RAG** | Google GenAI SDK (`@google/genai`), Gemini 2.5/3.0 Flash, Custom TF-IDF Semantic Engine |
| **PDF & Web Parser**| Puppeteer, Cheerio, pdf-parse |
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
│   │   └── services/        # Gemini AI, RAG semantic engine & URL scraper
│   ├── .env                 # Environment secrets
│   ├── package.json
│   └── server.js            # Express server entry point
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/        # Login, Register, Auth Context & Hooks
│   │   │   ├── dashboard/   # Analytics Dashboard & Skill Radar Chart
│   │   │   ├── interview/   # Home Page, Interview Strategy & Reports
│   │   │   ├── resume/      # Live ATS Resume Builder
│   │   │   └── voice/       # AI Voice Mock Interview Room
│   │   ├── app.routes.jsx   # Client routing
│   │   ├── main.jsx
│   │   └── style.scss       # Global CSS & SCSS styles
│   ├── index.html
│   └── package.json
├── 0_to_Hero_Interview_Prep_Guide.md  # Hinglish Complete Preparation & Architecture Guide
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB connection URI
- Google Gemini API Key (`GOOGLE_GENAI_API_KEY`)

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
