# CONTEXT.md — MVP Prototype

> **This is the single source of truth for all coding agents (Claude Code, Cursor, etc.).**
> Every file, route, component, and database table MUST conform to this document.
> Last updated: May 2026 — MVP v1.0

---

## 1. WHAT WE'RE BUILDING

A web platform where students request financial credit for their studies. Instead of repaying money, they repay by working for the company that funded them after graduation (2-3 years).

**This is an MVP / prototype.** We want:
- A working full-stack app with all business logic implemented
- Clean UI, functional — not pixel-perfect
- One LLM (Claude API) handles ALL AI tasks (scoring, matching, OCR, analysis)
- No microservices, no message queues, no complex infra
- Ship fast, iterate later

---

## 2. TECH STACK

```
FRONTEND: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
BACKEND:  FastAPI (Python 3.11+) + Anthropic SDK (Claude as the LLM)
DATABASE: Supabase (PostgreSQL + Auth + Storage)
AI:       Single LLM via API for ALL AI tasks (model configurable in .env)
```

### Why this stack?
- **Next.js**: SSR, great DX, Vercel deployment
- **FastAPI**: Python = easy LLM integration, async, fast prototyping
- **Supabase**: Auth + DB + Storage in one, free tier for MVP, no infra to manage
- **Single LLM**: Claude handles scoring, matching, OCR, contract generation — no separate ML models needed for MVP

---

## 3. PROJECT STRUCTURE

```
/
├── frontend/                    # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (student)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── credit-request/page.tsx
│   │   │   │   ├── documents/page.tsx
│   │   │   │   ├── contract/page.tsx
│   │   │   │   ├── tracking/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (company)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── needs/page.tsx
│   │   │   │   ├── assigned-students/page.tsx
│   │   │   │   ├── roi/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (admin)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── applications/page.tsx
│   │   │   │   ├── applications/[id]/page.tsx
│   │   │   │   ├── matching/page.tsx
│   │   │   │   ├── contracts/page.tsx
│   │   │   │   ├── payments/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Landing page
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui
│   │   │   ├── student/
│   │   │   ├── company/
│   │   │   ├── admin/
│   │   │   └── shared/               # navbar, sidebar
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── api.ts                # FastAPI client wrapper
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── hooks/
│   │       └── use-auth.ts
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── package.json
│
├── backend/                     # FastAPI app
│   ├── app/
│   │   ├── main.py              # Entry + CORS
│   │   ├── config.py            # Env vars
│   │   ├── dependencies.py      # Auth dependency
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── students.py
│   │   │   ├── companies.py
│   │   │   ├── admin.py
│   │   │   ├── contracts.py
│   │   │   ├── payments.py
│   │   │   └── documents.py
│   │   ├── services/
│   │   │   ├── llm.py           # ALL LLM calls — single file
│   │   │   ├── scoring.py       # Uses llm.py
│   │   │   ├── matching.py      # Uses llm.py
│   │   │   ├── contracts.py     # Uses llm.py
│   │   │   └── documents.py     # Uses llm.py
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic models
│   │   └── utils/
│   │       ├── helpers.py
│   │       └── business_rules.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── CONTEXT.md                   # THIS FILE
└── README.md
```

---

## 4. DATABASE SCHEMA (Supabase PostgreSQL)

### Enums

```sql
CREATE TYPE user_role AS ENUM ('student', 'company', 'admin');
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'scoring_done', 'matched', 'contract_proposed', 'contract_accepted', 'contract_refused', 'rejected', 'active', 'completed', 'suspended');
CREATE TYPE contract_status AS ENUM ('draft', 'proposed', 'accepted', 'active', 'completed', 'terminated', 'bought_out');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_direction AS ENUM ('company_to_platform', 'platform_to_student');
CREATE TYPE document_type AS ENUM ('cin', 'transcript', 'enrollment_certificate', 'cv', 'motivation_letter', 'photo', 'semester_report', 'internship_report', 'rc', 'company_statutes', 'cnss', 'financial_statement', 'job_description');
CREATE TYPE need_status AS ENUM ('open', 'matched', 'closed');
```

### Tables

```sql
-- USERS (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- STUDENT PROFILES
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    national_id TEXT,
    school_name TEXT,
    field_of_study TEXT,
    current_year INTEGER,
    gpa DECIMAL(4,2),
    city TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- COMPANY PROFILES
CREATE TABLE company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    rc_number TEXT,
    sector TEXT,
    size TEXT,
    city TEXT,
    description TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- CREDIT APPLICATIONS
CREATE TABLE credit_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student_profiles(id),
    requested_monthly_amount DECIMAL(10,2) NOT NULL,
    requested_duration_months INTEGER NOT NULL,
    justification TEXT NOT NULL,
    status application_status DEFAULT 'pending',
    ai_score DECIMAL(5,2),
    ai_score_breakdown JSONB,
    ai_scoring_rationale TEXT,
    admin_notes TEXT,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- COMPANY NEEDS
CREATE TABLE company_needs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_profiles(id),
    title TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    required_skills TEXT,
    investment_budget DECIMAL(12,2),
    contract_duration_months INTEGER,
    description TEXT,
    status need_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- MATCHES (admin pairs student <-> company need)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES credit_applications(id),
    need_id UUID NOT NULL REFERENCES company_needs(id),
    ai_match_score DECIMAL(5,2),
    ai_match_rationale TEXT,
    matched_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(application_id)
);

-- CONTRACTS
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id),
    application_id UUID NOT NULL REFERENCES credit_applications(id),
    student_id UUID NOT NULL REFERENCES student_profiles(id),
    company_id UUID NOT NULL REFERENCES company_profiles(id),
    monthly_amount DECIMAL(10,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    total_credit_amount DECIMAL(12,2) NOT NULL,
    platform_commission_rate DECIMAL(4,2) DEFAULT 10,
    platform_commission_amount DECIMAL(10,2),
    company_investment_total DECIMAL(12,2),
    work_duration_months INTEGER NOT NULL,
    estimated_salary DECIMAL(10,2),
    buyout_amount DECIMAL(12,2),
    contract_text TEXT,
    terms_and_conditions TEXT,
    status contract_status DEFAULT 'draft',
    proposed_at TIMESTAMPTZ,
    student_response_deadline TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id),
    direction payment_direction NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status payment_status DEFAULT 'pending',
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- DOCUMENTS
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    related_to UUID,
    doc_type document_type NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    ai_extracted_data JSONB,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SEMESTER REPORTS
CREATE TABLE semester_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id),
    student_id UUID NOT NULL REFERENCES student_profiles(id),
    semester_number INTEGER NOT NULL,
    gpa DECIMAL(4,2),
    ai_extracted_grades JSONB,
    document_id UUID REFERENCES documents(id),
    admin_notes TEXT,
    flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- INTERNSHIPS
CREATE TABLE internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id),
    student_id UUID NOT NULL REFERENCES student_profiles(id),
    company_id UUID NOT NULL REFERENCES company_profiles(id),
    year INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    company_evaluation TEXT,
    company_rating INTEGER CHECK (company_rating BETWEEN 1 AND 5),
    student_feedback TEXT,
    report_document_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 5. API ROUTES (FastAPI)

### Student routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/students/profile | Get own profile |
| PUT | /api/students/profile | Update profile |
| POST | /api/students/credit-request | Submit credit application |
| GET | /api/students/credit-request | Get own application + status |
| POST | /api/students/documents | Upload document |
| GET | /api/students/documents | List own documents |
| GET | /api/students/contract | Get proposed/active contract |
| POST | /api/students/contract/{id}/accept | Accept contract |
| POST | /api/students/contract/{id}/refuse | Refuse contract |
| GET | /api/students/payments | List received payments |
| POST | /api/students/semester-report | Upload semester report |
| GET | /api/students/notifications | List notifications |

### Company routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/companies/profile | Get own profile |
| PUT | /api/companies/profile | Update profile |
| POST | /api/companies/needs | Publish a need |
| GET | /api/companies/needs | List own needs |
| PUT | /api/companies/needs/{id} | Update a need |
| GET | /api/companies/assigned-students | List assigned students |
| GET | /api/companies/payments | List payments made |
| GET | /api/companies/roi | ROI dashboard data |
| GET | /api/companies/notifications | List notifications |

### Admin routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/admin/dashboard | KPIs |
| GET | /api/admin/applications | List all (filterable) |
| GET | /api/admin/applications/{id} | Full detail + docs |
| POST | /api/admin/applications/{id}/score | Trigger LLM scoring |
| POST | /api/admin/applications/{id}/reject | Reject with reason |
| POST | /api/admin/applications/{id}/approve | Approve |
| PUT | /api/admin/applications/{id}/notes | Add internal notes |
| GET | /api/admin/matching/suggestions/{app_id} | Get LLM match suggestions |
| POST | /api/admin/matching/confirm | Confirm match |
| POST | /api/admin/contracts/generate | Generate contract from match |
| POST | /api/admin/contracts/{id}/propose | Send contract to student |
| GET | /api/admin/contracts | List all contracts |
| GET | /api/admin/payments | List all payments |
| POST | /api/admin/payments/generate-schedule | Generate payment schedule |
| POST | /api/admin/payments/{id}/mark-paid | Mark as paid |
| GET | /api/admin/semester-reports | List all (flagged first) |
| GET | /api/admin/companies | List companies |
| POST | /api/admin/companies/{id}/verify | Verify company |

---

## 6. LLM SERVICE — THE BRAIN (backend/app/services/llm.py)

**One file, one model, all AI tasks.** This is the core of the MVP.

### Model: TO BE DECIDED — set in backend/.env as LLM_MODEL

### Functions:

**score_student(student_data, documents_text) -> dict**
- Input: student profile + motivation letter text + transcript text
- Prompt: scoring rubric (academic 40%, field 25%, motivation 20%, situation 15%)
- Output JSON: { total_score, breakdown: { academic, field_potential, motivation, situation }, rationale, risk_flags, recommendation }

**match_student_to_needs(student_data, score_data, company_needs) -> list**
- Input: scored student + list of open company needs
- Output JSON: { matches: [{ need_id, company_name, compatibility_score, rationale, concerns }] }
- Sorted by score descending

**extract_document_data(file_content, doc_type) -> dict**
- For transcripts: extract grades as JSON
- For CIN: extract name, ID number, birth date
- For motivation letters: extract themes + quality score
- For images: use Claude vision (base64 image input)

**generate_contract_text(match_data, financial_terms) -> str**
- Generate full contract in French
- Includes all 10 sections (parties, objet, obligations, financier, rachat, resiliation, duree, signatures)

**analyze_semester_report(grades_data, threshold) -> dict**
- Output: { calculated_gpa, is_below_threshold, trend, risk_level, summary, suggested_actions }

### When LLM is called:
| Trigger | Function | Who triggers |
|---------|----------|-------------|
| Admin clicks "Score" | score_student() | Admin panel |
| Admin clicks "Find matches" | match_student_to_needs() | Admin panel |
| Document uploaded | extract_document_data() | Auto |
| Admin generates contract | generate_contract_text() | Admin panel |
| Semester report uploaded | analyze_semester_report() | Auto |

### For image documents (scanned transcripts, CIN photos):
Use Claude vision — send base64 image in the messages array with type "image".

### JSON parsing:
Always strip markdown fences before parsing. Use a parse_json_response() helper.

---

## 7. BUSINESS RULES (backend/app/utils/business_rules.py)

```python
RULES = {
    "commission_rate": 0.10,              # 10% MVP
    "default_gpa_threshold": 10.0,        # /20 scale
    "buyout_margin": 0.20,                # +20%
    "insurance_contribution_rate": 0.03,  # 3%
    "insurance_reimbursement_min": 0.50,
    "insurance_reimbursement_max": 0.70,
    "min_work_duration_months": 24,
    "max_work_duration_months": 36,
    "min_salary_multiplier": 1.20,        # SMIG x 1.20
    "max_active_applications": 1,
    "reapplication_cooldown_days": 180,
    "contract_response_deadline_days": 15,
    "contract_reminder_days_before": 5,
}
```

### Key validations:
1. Student credit request: max 1 active application, 6-month cooldown after rejection
2. Scoring: only by admin, stores score + breakdown in DB
3. Matching: only on scored applications, admin picks from LLM suggestions
4. Contract generation: total = monthly x duration, commission = total x 10%, company pays total + commission, buyout = remaining x 1.20
5. Student accepts: status -> active, generate payment schedule, assign to company
6. Student refuses: closed, can reapply in 6 months
7. Semester report: auto-flag if GPA < threshold for 2 consecutive semesters
8. Payments: company pays total upfront to platform, platform pays monthly to student

---

## 8. FRONTEND PAGES

### Student pages
| Page | Content |
|------|---------|
| /student/dashboard | Status card, next payment, GPA, quick actions |
| /student/credit-request | Form: amount, duration, justification textarea |
| /student/documents | Upload per doc type, status indicators |
| /student/contract | View contract, Accept/Refuse buttons |
| /student/tracking | Payment history, semester upload, GPA chart |

### Company pages
| Page | Content |
|------|---------|
| /company/dashboard | Investment count, total invested, assigned students |
| /company/needs | List needs, create form |
| /company/assigned-students | Student cards with details |
| /company/roi | Investment vs savings chart |

### Admin pages
| Page | Content |
|------|---------|
| /admin/dashboard | KPI cards + charts |
| /admin/applications | Table with filters, click -> detail |
| /admin/applications/[id] | Full profile + docs + scoring panel + matching panel + contract gen |
| /admin/matching | Pending matches overview |
| /admin/contracts | All contracts table |
| /admin/payments | Payments table, mark as paid |

---

## 9. ENVIRONMENT VARIABLES

```env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=                            # to be decided
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=<supabase-jwt-secret>
```

---

## 10. AUTH FLOW

1. User registers on frontend -> Supabase Auth signUp()
2. DB trigger creates row in profiles with role
3. JWT returned, stored in cookie
4. FastAPI calls: JWT in Authorization header
5. FastAPI validates JWT, extracts user_id + role
6. Endpoints check role before processing

---

## 11. SUPABASE STORAGE

```
documents/ (private bucket)
├── students/{user_id}/cin.pdf, transcript.pdf, cv.pdf, etc.
├── companies/{user_id}/rc.pdf, statutes.pdf, etc.
└── contracts/{contract_id}.pdf
```

---

## 12. MVP SCOPE

### BUILD NOW
- Full auth (register, login, role-based routing)
- Student: credit request + documents + contract view + accept/refuse
- Company: register + publish needs + view assigned students + ROI
- Admin: review + LLM scoring + LLM matching + contracts + payments
- LLM everything (scoring, matching, contracts, OCR, analysis)
- Payment tracking (manual mark-as-paid)
- Semester reports + LLM analysis
- In-app notifications
- Basic dashboard charts

### SKIP FOR NOW
- Real payment gateway (CMI, Stripe)
- Electronic signature (accept button = agreement)
- Email/SMS notifications
- Mobile app
- Advanced ML models
- Multi-language (French only)
- 2FA
- Real KYC (admin verifies CIN manually)
- Internship module (manual tracking)
- Buyout payment flow

---

## 13. CODING CONVENTIONS

- Code language: English. UI text: French
- Files: kebab-case. Components: PascalCase
- API: /api/{resource} RESTful
- DB: snake_case. Pydantic/TS types: PascalCase
- Commits: Conventional (feat:, fix:, docs:)
- Always return { success, data } or { detail } on error
- Always handle errors gracefully on frontend with toast

---

## 14. GETTING STARTED

```bash
# 1. Setup Supabase project + run migrations + create storage bucket
# 2. Backend: cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
# 3. Frontend: cd frontend && npm install && npm run dev
# 4. Create admin user manually in Supabase SQL editor
```

---

## 15. GLOSSARY

| Term | Meaning |
|------|---------|
| Credit application | Student's request for monthly funding |
| Company need | Position a company wants to fill with a funded student |
| Match | Admin-confirmed pairing of student <-> company need |
| Contract | Tripartite agreement with financial terms |
| Scoring | LLM evaluation of student (/100) |
| Matching | LLM compatibility analysis student <-> company |
| Assignation directe | Admin assigns student to company — no company approval needed |
| Commission | 10% of total credit amount |
| Buyout (rachat) | Exit contract: remaining + 20% |
| Mutual insurance | Pool (3% per company) covers student abandonment |
