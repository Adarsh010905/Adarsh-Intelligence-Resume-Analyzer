# 🤖 AI Resume Analyzer

> A full-stack AI-powered resume analysis tool built with Django + React

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://postgresql.org)

## 📋 What Is This?

An AI-powered web application that analyzes your resume against a job description and gives you:
- 🎯 **Match Score** — How well your resume matches (0-100%)
- 📊 **Skill Gap Analysis** — Which skills you're missing
- 🤖 **AI Feedback** — Intelligent suggestions powered by Groq LLaMA AI
- 📈 **History** — Track improvements over time

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Vite, CSS |
| Backend | Python 3.11, Django 4.2, Django REST Framework |
| Auth | JWT (Simple JWT) |
| Database | PostgreSQL |
| AI | Groq (LLaMA 3) + spaCy + sentence-transformers |
| PDF | pdfplumber + PyPDF2 |
| Deployment | Docker, Gunicorn, Nginx |

## 🚀 Quick Start (Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Configure environment
cp .env.example .env
# Edit .env with your settings (DB password, API keys)

# Create PostgreSQL database
# In psql: CREATE DATABASE ai_resume_db;

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start backend
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

### 4. Access the App
- Link: (https://adarsh-intelligence.onrender.com/)

## 🐳 Docker (Run Everything at Once)

```bash
# Copy and configure environment
cp backend/.env.example backend/.env
# Edit with your API keys

# Build and run all services
docker-compose up --build

# Access:
# App: http://localhost
# API: http://localhost:8000
```

## 🔑 Environment Variables

Copy `backend/.env` and fill in these values:

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key (generate at djecrety.ir) |
| `DB_PASSWORD` | PostgreSQL password |
| `GROQ_API_KEY` | Free API key from console.groq.com |
| `OPENAI_API_KEY` | Optional: OpenAI key |

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Login, get JWT tokens |
| POST | `/api/auth/logout/` | Logout |
| POST | `/api/analyzer/analyze/` | Analyze resume |
| GET | `/api/analyzer/history/` | Analysis history |
| GET | `/api/analyzer/stats/` | Dashboard stats |

## 📁 Project Structure

```
AI resume/
├── backend/           # Django API
│   ├── accounts/      # Auth (User model, JWT)
│   ├── analyzer/      # Core AI logic
│   │   └── utils/     # PDF parser, NLP, AI
│   ├── config/        # Settings, URLs
│   └── requirements.txt
├── frontend/          # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/  # API client
│   │   └── context/   # Auth state
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🎓 Learning Objectives

By building this project, I learned:
- ✅ Django REST API with JWT authentication
- ✅ Custom Django User model (email-based)
- ✅ PostgreSQL with Django ORM
- ✅ React with React Router (client-side routing)
- ✅ React Context API for state management
- ✅ File uploads (PDF) in React + Django
- ✅ NLP with spaCy and sentence-transformers
- ✅ Docker containerization
- ✅ Full-stack architecture and deployment

## 🚢 Deploy to Render

1. Push code to GitHub
2. Create a new Web Service on Render pointing to `backend/`
3. Set environment variables in Render dashboard
4. Create PostgreSQL database on Render
5. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps.

## 👤 Author

Built as a learning project to master Python Full Stack Development.
