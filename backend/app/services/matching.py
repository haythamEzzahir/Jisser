from app.services.llm import match_student_to_needs
from app.database import get_supabase


async def get_match_suggestions(application_id: str) -> list[dict]:
    supabase = get_supabase()

    app = supabase.table("credit_applications").select("*").eq("id", application_id).execute()
    if not app.data or not app.data[0].get("ai_score"):
        raise ValueError("Application must be scored first")
    app_data = app.data[0]

    student = supabase.table("student_profiles").select("*").eq("id", app_data["student_id"]).execute()

    needs = supabase.table("company_needs").select("*, company_profiles!inner(company_name, sector)").eq("status", "open").execute()

    result = await match_student_to_needs(
        student_data={**student.data, "justification": app_data["justification"]},
        score_data={
            "total_score": app_data["ai_score"],
            "breakdown": app_data["ai_score_breakdown"],
        },
        company_needs=needs.data or [],
    )

    return result
