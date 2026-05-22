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

    match = supabase.table("matches").select("*").eq("id", match_id).single().execute()
    if not match.data:
        raise ValueError("Match not found")

    app = supabase.table("credit_applications").select("*").eq("id", application_id).single().execute()
    student = supabase.table("student_profiles").select("*").eq("id", app.data["student_id"]).single().execute()
    profile = supabase.table("profiles").select("full_name").eq("id", student.data["user_id"]).single().execute()

    need = supabase.table("company_needs").select("*").eq("id", match.data["need_id"]).single().execute()
    company = supabase.table("company_profiles").select("*").eq("id", need.data["company_id"]).single().execute()
    company_profile = supabase.table("profiles").select("full_name").eq("id", company.data["user_id"]).single().execute()

    monthly = float(app.data["requested_monthly_amount"])
    duration = int(app.data["requested_duration_months"])
    total = calculate_total_credit(monthly, duration)
    commission = calculate_commission(monthly, duration)
    investment = calculate_company_investment(monthly, duration)
    work_months = RULES["min_work_duration_months"]
    salary = float(need.data.get("investment_budget", 0)) / work_months if need.data.get("investment_budget") else None

    contract_text = await generate_contract_text(
        student_name=profile.data["full_name"],
        company_name=company.data["company_name"],
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
        "student_id": app.data["student_id"],
        "company_id": company.data["id"],
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
