export type UserRole = "student" | "company" | "admin";

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "scoring_done"
  | "matched"
  | "contract_proposed"
  | "contract_accepted"
  | "contract_refused"
  | "rejected"
  | "active"
  | "completed"
  | "suspended";

export type ContractStatus =
  | "draft"
  | "proposed"
  | "accepted"
  | "active"
  | "completed"
  | "terminated"
  | "bought_out";

export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";
export type PaymentDirection = "company_to_platform" | "platform_to_student";

export type DocType =
  | "cin"
  | "transcript"
  | "enrollment_certificate"
  | "cv"
  | "motivation_letter"
  | "photo"
  | "semester_report"
  | "internship_report"
  | "rc"
  | "company_statutes"
  | "cnss"
  | "financial_statement"
  | "job_description";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  date_of_birth?: string;
  national_id?: string;
  school_name?: string;
  field_of_study?: string;
  current_year?: number;
  gpa?: number;
  city?: string;
  bio?: string;
}

export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  rc_number?: string;
  sector?: string;
  size?: string;
  city?: string;
  description?: string;
  contact_name?: string;
  contact_phone?: string;
  verified: boolean;
}

export interface CreditApplication {
  id: string;
  student_id: string;
  requested_monthly_amount: number;
  requested_duration_months: number;
  justification: string;
  status: ApplicationStatus;
  ai_score?: number;
  ai_score_breakdown?: Record<string, number>;
  ai_scoring_rationale?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface CompanyNeed {
  id: string;
  company_id: string;
  title: string;
  field_of_study: string;
  required_skills?: string;
  investment_budget?: number;
  contract_duration_months?: number;
  description?: string;
  status: "open" | "matched" | "closed";
  created_at: string;
}

export interface Match {
  id: string;
  application_id: string;
  need_id: string;
  ai_match_score?: number;
  ai_match_rationale?: string;
  matched_by?: string;
  created_at: string;
}

export interface Contract {
  id: string;
  match_id: string;
  application_id: string;
  student_id: string;
  company_id: string;
  monthly_amount: number;
  duration_months: number;
  total_credit_amount: number;
  platform_commission_rate: number;
  platform_commission_amount: number;
  company_investment_total: number;
  work_duration_months: number;
  estimated_salary?: number;
  buyout_amount?: number;
  contract_text?: string;
  terms_and_conditions?: string;
  status: ContractStatus;
  proposed_at?: string;
  student_response_deadline?: string;
  accepted_at?: string;
  activated_at?: string;
}

export interface Payment {
  id: string;
  contract_id: string;
  direction: PaymentDirection;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: PaymentStatus;
  reference?: string;
}

export interface Document {
  id: string;
  uploaded_by: string;
  related_to?: string;
  doc_type: DocType;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  ai_extracted_data?: Record<string, unknown>;
  verified: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface SemesterReport {
  id: string;
  contract_id: string;
  student_id: string;
  semester_number: number;
  gpa?: number;
  ai_extracted_grades?: Record<string, unknown>;
  flagged: boolean;
  created_at: string;
}

export interface DashboardKPI {
  total_applications: number;
  pending_review: number;
  scored: number;
  active_contracts: number;
  total_companies: number;
  total_invested: number;
}
