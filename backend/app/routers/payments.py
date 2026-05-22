from fastapi import APIRouter, Depends
from app.dependencies import verify_token

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/")
async def list_payments(auth: dict = Depends(verify_token)):
    from app.database import get_supabase
    supabase = get_supabase()
    profiles = supabase.table("profiles").select("role").eq("id", auth["user_id"]).execute()
    if not profiles.data:
        return {"success": True, "data": []}
    role = profiles.data[0].get("role")

    if role == "student":
        students = supabase.table("student_profiles").select("id").eq("user_id", auth["user_id"]).execute()
        if not students.data:
            return {"success": True, "data": []}
        contracts = supabase.table("contracts").select("id").eq("student_id", students.data[0]["id"]).execute()
    elif role == "company":
        companies = supabase.table("company_profiles").select("id").eq("user_id", auth["user_id"]).execute()
        if not companies.data:
            return {"success": True, "data": []}
        contracts = supabase.table("contracts").select("id").eq("company_id", companies.data[0]["id"]).execute()
    else:
        result = supabase.table("payments").select("*").order("due_date", desc=True).execute()
        return {"success": True, "data": result.data}

    ids = [c["id"] for c in contracts.data] if contracts.data else []
    if not ids:
        return {"success": True, "data": []}
    result = supabase.table("payments").select("*").in_("contract_id", ids).order("due_date", desc=True).execute()
    return {"success": True, "data": result.data}
