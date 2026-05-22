from fastapi import APIRouter, Depends
from app.dependencies import verify_token

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/")
async def list_payments(auth: dict = Depends(verify_token)):
    from app.database import get_supabase
    supabase = get_supabase()
    profile = supabase.table("profiles").select("role").eq("id", auth["user_id"]).single().execute()
    role = profile.data.get("role")

    if role == "student":
        student = supabase.table("student_profiles").select("id").eq("user_id", auth["user_id"]).single().execute()
        if not student.data:
            return {"success": True, "data": []}
        contracts = supabase.table("contracts").select("id").eq("student_id", student.data["id"]).execute()
    elif role == "company":
        company = supabase.table("company_profiles").select("id").eq("user_id", auth["user_id"]).single().execute()
        if not company.data:
            return {"success": True, "data": []}
        contracts = supabase.table("contracts").select("id").eq("company_id", company.data["id"]).execute()
    else:
        result = supabase.table("payments").select("*").order("due_date", desc=True).execute()
        return {"success": True, "data": result.data}

    ids = [c["id"] for c in contracts.data] if contracts.data else []
    if not ids:
        return {"success": True, "data": []}
    result = supabase.table("payments").select("*").in_("contract_id", ids).order("due_date", desc=True).execute()
    return {"success": True, "data": result.data}
