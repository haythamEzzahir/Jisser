export type UserRole = "student" | "company" | "admin";
export type ApplicationStatus =
  | "pending" | "under_review" | "scoring_done" | "matched"
  | "contract_proposed" | "contract_accepted" | "contract_refused"
  | "rejected" | "active" | "completed" | "suspended";

export type ContractStatus =
  | "draft" | "proposed" | "accepted" | "active" | "completed" | "terminated" | "bought_out";

export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";
export type PaymentDirection = "company_to_platform" | "platform_to_student";
export type DocType =
  | "cin" | "transcript" | "enrollment_certificate" | "cv" | "motivation_letter"
  | "photo" | "semester_report" | "internship_report" | "rc" | "company_statutes"
  | "cnss" | "financial_statement" | "job_description";
export type NeedStatus = "open" | "matched" | "closed";

export interface AuthPayload {
  user_id: string;
  role: UserRole;
}

export interface CreditRequestInput {
  requested_monthly_amount: number;
  requested_duration_months: number;
  justification: string;
}

export interface CompanyNeedInput {
  title: string;
  field_of_study: string;
  required_skills?: string;
  investment_budget?: number;
  contract_duration_months?: number;
  description?: string;
}

export interface StudentProfileInput {
  date_of_birth?: string;
  national_id?: string;
  school_name?: string;
  field_of_study?: string;
  current_year?: number;
  gpa?: number;
  city?: string;
  bio?: string;
  education_level?: string;
  extra_data?: Record<string, unknown>;
}

export interface CompanyProfileInput {
  company_name: string;
  rc_number?: string;
  sector?: string;
  size?: string;
  city?: string;
  description?: string;
  contact_name?: string;
  contact_phone?: string;
}

export interface MatchConfirmInput {
  application_id: string;
  need_id: string;
}
