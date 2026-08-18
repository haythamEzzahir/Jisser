# 🤝 Jisser — Student Financing & Talent Matching Platform

> A full-stack platform that helps students finance their education through companies that support them in exchange for a future work commitment after graduation.

---

## ✨ Features

* 🎓 **Student Financing Requests** — Students can submit requests for financial support for their studies
* 📄 **Document Management** — Upload and manage documents required for financing applications
* 🤖 **AI-Powered Evaluation** — Use AI to analyze applications and support student scoring
* 🔗 **Student–Company Matching** — Match students with companies based on skills, profiles, and company needs
* 📝 **Contract Management** — Generate and manage financing and employment-related contracts
* 📊 **Student Dashboard** — Track applications, documents, contracts, and financing progress
* 🏢 **Company Dashboard** — Manage company needs and view assigned students
* 👨‍💼 **Admin Dashboard** — Review applications, manage matching, contracts, and payments
* 🔐 **Authentication & Authorization** — Role-based access for students, companies, and administrators
* 💳 **Payment Tracking** — Manage and track financing-related payments
* 📈 **Progress Tracking** — Follow the student's journey from application to post-graduation employment
* 📱 **Responsive Interface** — Modern responsive UI built for different screen sizes

---

## 🛠️ Technologies Used

### Frontend

* **Next.js 14**
* **React 18**
* **TypeScript**
* **Tailwind CSS**
* **shadcn/ui / Radix UI**
* **Lucide React**
* **Sonner**
* **Supabase JavaScript Client**

### Backend

* **Python 3.11+**
* **FastAPI**
* **Pydantic**
* **Uvicorn**
* **Python-JOSE**
* **Passlib / Bcrypt**
* **HTTPX**
* **Alembic**
* **Psycopg2**

### Database & Services

* **Supabase** — PostgreSQL database, authentication, and storage
* **Anthropic Claude API** — AI-powered scoring, matching, document analysis, and contract generation
* **PostgreSQL** — Application data persistence

The current repository uses Next.js 14 on the frontend and FastAPI on the backend, with Supabase as the main database/auth/storage layer.

---

## 🏗️ Architecture

```text
Jisser/
│
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # Authentication pages
│   │   │   ├── dashboard/    # Student dashboard
│   │   │   ├── credit-request/
│   │   │   ├── documents/
│   │   │   ├── contract/
│   │   │   ├── tracking/
│   │   │   ├── company/      # Company portal
│   │   │   ├── admin/        # Administration portal
│   │   │   └── ...
│   │   │
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # API & Supabase utilities
│   │   ├── hooks/             # Custom React hooks
│   │   └── types/             # TypeScript types
│   │
│   └── package.json
│
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py           # Application entry point
│   │   ├── config.py         # Environment configuration
│   │   ├── dependencies.py   # Authentication dependencies
│   │   ├── routers/          # API routes
│   │   ├── services/         # Business & AI logic
│   │   ├── models/           # Pydantic models
│   │   ├── middleware/       # Backend middleware
│   │   └── utils/            # Utility functions
│   │
│   └── requirements.txt
│
├── database/                 # Database-related resources
├── supabase/                 # Supabase configuration & migrations
├── .env.example              # Environment variable template
├── CONTEXT.md                # Project specification
├── ROADMAP-MVP.md            # MVP roadmap
└── README.md
```

---

## 🔄 How It Works

```text
Student
   │
   ▼
Create Account
   │
   ▼
Submit Financing Request
   │
   ▼
Upload Documents
   │
   ▼
AI Evaluation & Scoring
   │
   ▼
Company Matching
   │
   ▼
Company Reviews Student
   │
   ▼
Financing / Contract
   │
   ▼
Student Completes Studies
   │
   ▼
Future Employment Commitment
```

Companies can also define their talent needs and discover students whose profiles match their requirements.

---

## 🤖 AI Integration

Jisser is designed around a **single LLM architecture** for its AI functionality.

The AI layer can support:

* 📊 **Student Scoring** — Evaluate student applications
* 🔍 **Application Analysis** — Analyze submitted information and documents
* 🤝 **Talent Matching** — Match students with suitable companies
* 📄 **Document Processing** — Extract and analyze information from documents
* 📝 **Contract Generation** — Assist with generating personalized contracts

Using a single LLM keeps the MVP architecture simple and makes it easier to iterate quickly.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/haythamEzzahir/Jisser.git
cd Jisser
```

### 2. Configure environment variables

Create your environment file from the provided example:

```bash
cp .env.example .env
```

Configure your Supabase credentials and backend URL:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

BACKEND_URL=http://localhost:8000
```

The repository already provides an `.env.example` with these variables.

---

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

---

### 4. Start the frontend

```bash
npm run dev
```

The Next.js development server will start locally.

---

### 5. Set up the backend

Open another terminal:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\Activate.ps1
```

Activate it on macOS/Linux:

```bash
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

---

### 6. Start the FastAPI backend

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI's interactive API documentation is available at:

```text
http://localhost:8000/docs
```

---

## 🗄️ Database

Jisser uses **Supabase PostgreSQL** as its primary database.

Supabase is also used for:

* 🔐 Authentication
* 🗃️ PostgreSQL database
* 📁 File/document storage
* 🔑 Secure access through Supabase credentials

Database-related resources are located in the `database/` and `supabase/` directories.

---

## 👥 User Roles

### 🎓 Student

Students can:

* Create an account
* Submit financing requests
* Upload required documents
* Track their application
* View potential company matches
* Manage contracts
* Track their progress

### 🏢 Company

Companies can:

* Manage their organization profile
* Define talent requirements
* Discover matching students
* Review assigned students
* Track expected ROI and recruitment outcomes

### 👨‍💼 Administrator

Administrators can:

* Review student applications
* Manage the matching process
* Manage companies and students
* Review contracts
* Track payments
* Monitor the overall platform

---

## 📂 Main Project Resources

* [`CONTEXT.md`](./CONTEXT.md) — Complete MVP technical and functional specification
* [`ROADMAP-MVP.md`](./ROADMAP-MVP.md) — Development roadmap
* [`Cahier_des_Charges_v3.pdf`](./Cahier_des_Charges_v3.pdf) — Project requirements and specifications

---

## 🚧 Project Status

**Jisser is currently an MVP / prototype.**

The project focuses on validating the core workflow:

> **Student financing → AI evaluation → Company matching → Contract → Future employment**

The architecture intentionally avoids unnecessary microservices and complex infrastructure in order to keep development fast and focused during the MVP stage.

---

## 🌐 Repository

🚀 **Jisser on GitHub:**
https://github.com/haythamEzzahir/Jisser

---

## 📄 License

This project is currently provided as an MVP/prototype.

License information can be added once the project license is finalized.
