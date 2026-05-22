from app.services.llm import generate_contract_text
from app.database import get_supabase
from app.utils.business_rules import (
    calculate_total_credit,
    calculate_commission,
    calculate_company_investment,
    RULES,
)
from datetime import datetime, timedelta


async def generate_contract(match_id: str, application_id: str) -> dict:
    supabase = get_supabase()

    match = supabase.table("matches").select("*").eq("id", match_id).execute()
    if not match.data:
        raise ValueError("Match not found")
    match_data = match.data[0]

    app = supabase.table("credit_applications").select("*").eq("id", application_id).execute()
    if not app.data:
        raise ValueError("Application not found")
    app_data = app.data[0]

    student = supabase.table("student_profiles").select("*").eq("id", app_data["student_id"]).execute()
    student_data = student.data[0] if student.data else {}
    profile = supabase.table("profiles").select("full_name").eq("id", student_data["user_id"]).execute()

    need = supabase.table("company_needs").select("*").eq("id", match_data["need_id"]).execute()
    need_data = need.data[0] if need.data else {}
    company = supabase.table("company_profiles").select("*").eq("id", need_data["company_id"]).execute()
    company_data = company.data[0] if company.data else {}
    company_profile = supabase.table("profiles").select("full_name").eq("id", company_data["user_id"]).execute()

    monthly = float(app_data["requested_monthly_amount"])
    duration = int(app_data["requested_duration_months"])
    total = calculate_total_credit(monthly, duration)
    commission = calculate_commission(monthly, duration)
    investment = calculate_company_investment(monthly, duration)
    work_months = RULES["min_work_duration_months"]
    salary = float(need_data.get("investment_budget", 0)) / work_months if need_data.get("investment_budget") else None

    contract_text = await generate_contract_text(
        student_name=profile.data[0]["full_name"] if profile.data else "Étudiant",
        company_name=company_data["company_name"],
        monthly_amount=monthly,
        duration_months=duration,
        total_credit=total,
        commission=commission,
        work_months=work_months,
        estimated_salary=salary or 0,
    )

    deadline = datetime.utcnow() + timedelta(days=RULES["contract_response_deadline_days"])

    result = supabase.table("contracts").insert({
        "match_id": match_id,
        "application_id": application_id,
        "student_id": app_data["student_id"],
        "company_id": company_data["id"],
        "monthly_amount": monthly,
        "duration_months": duration,
        "total_credit_amount": total,
        "platform_commission_rate": RULES["commission_rate"] * 100,
        "platform_commission_amount": commission,
        "company_investment_total": investment,
        "work_duration_months": work_months,
        "estimated_salary": salary,
        "contract_text": contract_text,
        "status": "draft",
    }).execute()

    return result.data[0]
