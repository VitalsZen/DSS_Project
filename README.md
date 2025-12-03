---
title: CareerFlow Backend
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

## 🎥 Video DEMO: [https://www.youtube.com/watch?v=UmhBNERNMZM](https://www.youtube.com/watch?v=UmhBNERNMZM)


# CareerFlow – AI-Powered Personal ATS & CV Analyzer

## 1. Project Title
**CareerFlow: Intelligent Application Tracking System & Resume Analyzer using RAG Technology**

## 2. Project Description
CareerFlow is a modern web application designed to assist job seekers in optimizing their applications. By leveraging **Retrieval-Augmented Generation (RAG)**, the system analyzes the compatibility between a candidate's CV (PDF) and a Job Description (JD).

It utilizes **Google Gemini 1.5 Flash** for high-level reasoning and **HuggingFace Embeddings** (running locally via CPU) for cost-effective vector search. The system features a "Guest Mode" architecture, allowing instant usage without registration while maintaining data privacy via **PostgreSQL**.

**Key Capabilities:**
* **Instant Analysis:** Matches CV keywords, experience, and skills against JD requirements.
* **Visual Insights:** Generates a Radar Chart with detailed reasoning for 5 key competency areas.
* **Explainable AI:** Provides specific evidence from the CV for every score given.
* **Pipeline Management:** Tracks application status (Applied, Interviewing, Offer).
* **Bilingual Support:** Full interface and AI analysis support for **English** and **Vietnamese**.

## 3. Contents
The repository is organized as a Monorepo containing both Frontend and Backend:

* **`backend/`**: Python FastAPI application (The AI Brain).
    * `core_logic.py`: Implements the RAG pipeline (PDF parsing, Chunking, Embedding, LLM Chain).
    * `server.py`: API endpoints and Database session management.
    * `models.py`: Database schemas (User, Application, JobDescription) using SQLModel/SQLAlchemy.
    * `database.py`: DB connection logic (Supports SQLite for local & PostgreSQL for production).
    * `Dockerfile`: Configuration for deploying to Hugging Face Spaces.
* **`frontend/`**: React application (The User Interface).
    * Built with **Vite**, **Tailwind CSS**, and **Recharts**.
    * Manages state via Context API (`ApplicationContext`, `JdContext`).
* **`docs/`** *(Optional)*:
    * System Architecture Diagrams.
    * User Manual / Project Report.

## 4. System Architecture
The project follows a Hybrid Cloud Architecture to optimize performance and cost:

1.  **Frontend:** Deployed on **Vercel**.
2.  **Backend:** Containerized with **Docker** and hosted on **Hugging Face Spaces** (utilizing 16GB RAM for AI tasks).
3.  **Database:** **PostgreSQL** hosted on **Supabase** (Transaction Pooler mode).
4.  **AI Services:**
    * **LLM:** Google Gemini 1.5 Flash (via API).
    * **Embeddings:** `sentence-transformers/all-MiniLM-L6-v2` (Running locally in Docker).

## 5. Requirements

### 5.1. System Requirements
* **OS:** Windows, macOS, or Linux.
* **Runtime:**
    * Python 3.10+
    * Node.js 18+
* **Docker Desktop** (Optional, for local container testing).

### 5.2. Key Libraries & Tools
* **Backend:** `fastapi`, `uvicorn`, `langchain`, `langchain-google-genai`, `langchain-huggingface`, `chromadb`, `sqlmodel`, `psycopg2-binary`, `pdfplumber`.
* **Frontend:** `react`, `react-router-dom`, `recharts`, `tailwindcss`, `lucide-react`.

### 5.3. External API Keys
* **Google AI Studio:** API Key for Gemini models.
* **Supabase:** PostgreSQL Connection String.

## 6. How to Run (Local Development)

### a. Setup Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    * Create a `.env` file in `backend/`.
    * Add: `GOOGLE_API_KEY=your_gemini_key`
    * Add: `DATABASE_URL=sqlite:///database.db` (for local testing) OR your Supabase URL.
5.  Start the Server:
    ```bash
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
    ```

### b. Setup Frontend
1.  Open a new terminal and navigate to frontend:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    * Create a `.env` file in `frontend/`.
    * Add: `VITE_API_URL=http://127.0.0.1:8000`
4.  Start React Dev Server:
    ```bash
    npm run dev
    ```
5.  Access the app at `http://localhost:5173`.

## 7. Deployment Guide (CI/CD)

The project is configured for automated deployment:

1.  **Backend (Hugging Face Spaces):**
    * Connect GitHub Repository to Hugging Face Space.
    * Set Secrets in Space Settings: `GOOGLE_API_KEY`, `DATABASE_URL` (Use connection string with port 6543).
    * The `Dockerfile` in the root will automatically build the environment.

2.  **Frontend (Vercel):**
    * Connect GitHub Repository to Vercel.
    * Set Environment Variable: `VITE_API_URL` -> Link to your Hugging Face Space (e.g., `https://your-space-name.hf.space`).
    * Vercel will auto-deploy on every push to `main`.

## Contact

For questions or further information, please contact:

- **Supervisor:** MSc. Nguyen Ho Duy Tri – trinhd@uit.edu.vn  
- **Group members:**  
  - Pham Huynh Tan Khang – 22520624@gm.uit.edu.vn  
  - Huynh Ngoc Trang – 22521510@gm.uit.edu.vn


