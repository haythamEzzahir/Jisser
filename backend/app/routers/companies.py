from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase
from app.models.schemas import CompanyProfileCreate, CompanyNeedCreate
from app.dependencies import verify_token, company_only

router = APIRouter(prefix="/api/companies", tags=["companies"])


@router.get("/profile")
async def get_profile(auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    result = supabase.table("company_profiles").select("*").eq("user_id", auth["user_id"]).execute()
    return {"success": True, "data": result.data[0] if result.data else None}


@router.put("/profile")
async def update_profile(profile: CompanyProfileCreate, auth: dict = Depends(company_only)):
    supabase = get_supabase()
    existing = supabase.table("company_profiles").select("id").eq("user_id", auth["user_id"]).execute()
    if existing.data:
        result = supabase.table("company_profiles").update(profile.model_dump(exclude_none=True)).eq("user_id", auth["user_id"]).execute()
    else:
        result = supabase.table("company_profiles").insert({
            "user_id": auth["user_id"],
            **profile.model_dump(exclude_none=True)
        }).execute()
    return {"success": True, "data": result.data[0]}


@router.post("/needs")
async def create_need(need: CompanyNeedCreate, auth: dict = Depends(company_only)):
    supabase = get_supabase()
    companies = supabase.table("company_profiles").select("id").eq("user_id", auth["user_id"]).execute()
    if not companies.data:
        raise HTTPException(status_code=400, detail="Complete your company profile first")
    result = supabase.table("company_needs").insert({
        "company_id": companies.data[0]["id"],
        **need.model_dump(exclude_none=True)
    }).execute()
    return {"success": True, "data": result.data[0]}


@router.get("/needs")
async def list_needs(auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    companies = supabase.table("company_profiles").select("id").eq("user_id", auth["user_id"]).execute()
    if not companies.data:
        return {"success": True, "data": []}
    result = supabase.table("company_needs").select("*").eq("company_id", companies.data[0]["id"]).order("created_at", desc=True).execute()
    return {"success": True, "data": result.data}


@router.put("/needs/{need_id}")
async def update_need(need_id: str, need: CompanyNeedCreate, auth: dict = Depends(company_only)):
    supabase = get_supabase()
    result = supabase.table("company_needs").update(need.model_dump(exclude_none=True)).eq("id", need_id).execute()
    return {"success": True, "data": result.data[0]}


@router.get("/assigned-students")
async def get_assigned_students(auth: dict = Depends(company_only)):
    supabase = get_supabase()
    companies = supabase.table("company_profiles").select("id").eq("user_id", auth["user_id"]).execute()
    if not companies.data:
        return {"success": True, "data": []}
    contracts = supabase.table("contracts").select("*, student_profiles!inner(*, profiles!inner(full_name, email))").eq("company_id", companies.data[0]["id"]).in_("status", ["active", "completed"]).execute()
    return {"success": True, "data": contracts.data}


@router.get("/payments")
async def list_payments(auth: dict = Depends(company_only)):
    supabase = get_supabase()
    companies = supabase.table("company_profiles").select("id").eq("user_id", auth["user_id"]).execute()
    if not companies.data:
        return {"success": True, "data": []}
    contracts = supabase.table("contracts").select("id").eq("company_id", companies.data[0]["id"]).execute()
    ids = [c["id"] for c in contracts.data] if contracts.data else []
    if not ids:
        return {"success": True, "data": []}
    result = supabase.table("payments").select("*").in_("contract_id", ids).order("due_date", desc=True).execute()
    return {"success": True, "data": result.data}


@router.get("/roi")
async def get_roi(auth: dict = Depends(company_only)):
    supabase = get_supabase()
    companies = supabase.table("company_profiles").select("id").eq("user_id", auth["user_id"]).execute()
    if not companies.data:
        return {"success": True, "data": None}
    contracts = supabase.table("contracts").select("*").eq("company_id", companies.data[0]["id"]).execute()
    total_invested = sum(float(c.get("company_investment_total", 0)) for c in contracts.data)
    active = sum(1 for c in contracts.data if c["status"] == "active")
    completed = sum(1 for c in contracts.data if c["status"] == "completed")
    total_salary_saved = completed * 120000
    return {"success": True, "data": {
        "total_invested": total_invested,
        "active_contracts": active,
        "completed_contracts": completed,
        "estimated_roi": total_salary_saved - total_invested if total_invested > 0 else 0,
    }}


@router.get("/notifications")
async def list_notifications(auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    result = supabase.table("notifications").select("*").eq("user_id", auth["user_id"]).order("created_at", desc=True).limit(20).execute()
    return {"success": True, "data": result.data}
