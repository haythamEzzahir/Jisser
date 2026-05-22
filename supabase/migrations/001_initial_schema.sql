-- DINEXT MVP — Initial Schema (compatible Supabase SQL Editor)

-- ============ TABLES ============

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'company', 'admin')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE credit_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student_profiles(id),
    requested_monthly_amount DECIMAL(10,2) NOT NULL,
    requested_duration_months INTEGER NOT NULL,
    justification TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'scoring_done', 'matched', 'contract_proposed', 'contract_accepted', 'contract_refused', 'rejected', 'active', 'completed', 'suspended')),
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

CREATE TABLE company_needs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_profiles(id),
    title TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    required_skills TEXT,
    investment_budget DECIMAL(12,2),
    contract_duration_months INTEGER,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

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
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'proposed', 'accepted', 'active', 'completed', 'terminated', 'bought_out')),
    proposed_at TIMESTAMPTZ,
    student_response_deadline TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id),
    direction TEXT NOT NULL CHECK (direction IN ('company_to_platform', 'platform_to_student')),
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    related_to UUID,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('cin', 'transcript', 'enrollment_certificate', 'cv', 'motivation_letter', 'photo', 'semester_report', 'internship_report', 'rc', 'company_statutes', 'cnss', 'financial_statement', 'job_description')),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    ai_extracted_data JSONB,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ INDEXES ============
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_credit_applications_status ON credit_applications(status);
CREATE INDEX idx_credit_applications_student ON credit_applications(student_id);
CREATE INDEX idx_company_needs_company ON company_needs(company_id);
CREATE INDEX idx_company_needs_status ON company_needs(status);
CREATE INDEX idx_matches_application ON matches(application_id);
CREATE INDEX idx_matches_need ON matches(need_id);
CREATE INDEX idx_contracts_student ON contracts(student_id);
CREATE INDEX idx_contracts_company ON contracts(company_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_documents_uploader ON documents(uploaded_by);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============ ROW LEVEL SECURITY ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own, admins read all
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Student profiles
CREATE POLICY "Students read own" ON student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students insert own" ON student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students update own" ON student_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Company profiles
CREATE POLICY "Companies read own" ON company_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Companies insert own" ON company_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Companies update own" ON company_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Applications: student reads own, admin reads all
CREATE POLICY "Students read own applications" ON credit_applications
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM student_profiles WHERE id = student_id));
CREATE POLICY "Students insert applications" ON credit_applications
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM student_profiles WHERE id = student_id));

-- Notifications: users read own
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
