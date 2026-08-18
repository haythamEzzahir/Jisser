from app.services.llm import score_student
from app.database import get_supabase
from datetime import datetime


async def trigger_scoring(application_id: str) -> dict:
    supabase = get_supabase()

    app = supabase.table("credit_applications").select("*").eq("id", application_id).execute()
    if not app.data:
        raise ValueError("Application not found")
    app_data = app.data[0]

    student = supabase.table("student_profiles").select("*").eq("id", app_data["student_id"]).execute()
    profile = student.data[0] if student.data else {}

    documents = supabase.table("documents").select("*").eq("related_to", application_id).execute()
    docs_text = {}
    for doc in documents.data or []:
        if doc["ai_extracted_data"]:
            docs_text[doc["doc_type"]] = doc["ai_extracted_data"]

    result = await score_student(
        profile=profile,
        justification=app_data.get("justification", ""),
        documents_text=docs_text or None,
    )

    supabase.table("credit_applications").update({
        "ai_score": result["total_score"],
        "ai_score_breakdown": result["breakdown"],
        "ai_scoring_rationale": result["rationale"],
        "status": "scoring_done",
        "reviewed_at": datetime.utcnow().isoformat(),
    }).eq("id", application_id).execute()

    return result
