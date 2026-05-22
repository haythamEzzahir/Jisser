from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import date, datetime
from enum import Enum


class UserRole(str, Enum):
    student = "student"
    company = "company"
    admin = "admin"


class ApplicationStatus(str, Enum):
    pending = "pending"
    under_review = "under_review"
    scoring_done = "scoring_done"
    matched = "matched"
    contract_proposed = "contract_proposed"
    contract_accepted = "contract_accepted"
    contract_refused = "contract_refused"
    rejected = "rejected"
    active = "active"
    completed = "completed"
    suspended = "suspended"


class ContractStatus(str, Enum):
    draft = "draft"
    proposed = "proposed"
    accepted = "accepted"
    active = "active"
    completed = "completed"
    terminated = "terminated"
    bought_out = "bought_out"


class PaymentStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    overdue = "overdue"
    cancelled = "cancelled"


class PaymentDirection(str, Enum):
    company_to_platform = "company_to_platform"
    platform_to_student = "platform_to_student"


class DocType(str, Enum):
    cin = "cin"
    transcript = "transcript"
    enrollment_certificate = "enrollment_certificate"
    cv = "cv"
    motivation_letter = "motivation_letter"
    photo = "photo"
    semester_report = "semester_report"
    internship_report = "internship_report"
    rc = "rc"
    company_statutes = "company_statutes"
    cnss = "cnss"
    financial_statement = "financial_statement"
    job_description = "job_description"


class NeedStatus(str, Enum):
    open = "open"
    matched = "matched"
    closed = "closed"


# ============ AUTH ============

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: UserRole = UserRole.student


class LoginRequest(BaseModel):
    email: str
    password: str


# ============ PROFILES ============

class StudentProfileCreate(BaseModel):
    date_of_birth: Optional[date] = None
    national_id: Optional[str] = None
    school_name: Optional[str] = None
    field_of_study: Optional[str] = None
    current_year: Optional[int] = None
    gpa: Optional[float] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    education_level: Optional[str] = None
    extra_data: Optional[dict] = None


class CompanyProfileCreate(BaseModel):
    company_name: str
    rc_number: Optional[str] = None
    sector: Optional[str] = None
    size: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None


# ============ CREDIT ============

class CreditRequestCreate(BaseModel):
    requested_monthly_amount: float
    requested_duration_months: int
    justification: str


# ============ COMPANY NEEDS ============

class CompanyNeedCreate(BaseModel):
    title: str
    field_of_study: str
    required_skills: Optional[str] = None
    investment_budget: Optional[float] = None
    contract_duration_months: Optional[int] = None
    description: Optional[str] = None


# ============ CONTRACTS ============

class ContractGenerateRequest(BaseModel):
    match_id: str
    application_id: str


class ContractResponse(BaseModel):
    id: str
    match_id: str
    status: ContractStatus
    monthly_amount: float
    duration_months: int
    total_credit_amount: float
    platform_commission_amount: float
    company_investment_total: float
    work_duration_months: int
    estimated_salary: Optional[float]
    contract_text: Optional[str]
    student_response_deadline: Optional[datetime]


# ============ PAYMENTS ============

class PaymentCreate(BaseModel):
    contract_id: str
    direction: PaymentDirection
    amount: float
    due_date: date


# ============ MATCHING ============

class MatchConfirm(BaseModel):
    application_id: str
    need_id: str


# ============ DOCUMENTS ============

class DocumentUploadResponse(BaseModel):
    id: str
    doc_type: str
    file_name: str
    file_url: str
    verified: bool
    ai_extracted_data: Optional[dict]


# ============ SCORING ============

class ScoreResponse(BaseModel):
    total_score: float
    breakdown: dict
    rationale: str
    risk_flags: list[str]
    recommendation: str


# ============ NOTIFICATIONS ============

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    link: Optional[str] = None


# ============ GENERIC ============

class SuccessResponse(BaseModel):
    success: bool = True
    data: Any = None


class ErrorResponse(BaseModel):
    detail: str
