from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase
from app.models.schemas import StudentProfileCreate, CreditRequestCreate
from app.dependencies import verify_token
from postgrest.exceptions import APIError

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("/profile")
async def get_profile(auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    result = supabase.table("student_profiles").select("*").eq("user_id", auth["user_id"]).execute()
    if not result.data:
        return {"success": True, "data": None}
    return {"success": True, "data": result.data[0]}


def _try_upsert_profile(supabase, data: dict, user_id: str):
    existing = supabase.table("student_profiles").select("id").eq("user_id", user_id).execute()
    if existing.data:
        return supabase.table("student_profiles").update(data).eq("user_id", user_id).execute()
    return supabase.table("student_profiles").insert({"user_id": user_id, **data}).execute()


@router.put("/profile")
async def update_profile(profile: StudentProfileCreate, auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    data = profile.model_dump(exclude_none=True)
    try:
        result = _try_upsert_profile(supabase, data, auth["user_id"])
    except APIError as e:
        if "education_level" in str(e) or "extra_data" in str(e):
            safe_data = {k: v for k, v in data.items() if k not in ("education_level", "extra_data")}
            result = _try_upsert_profile(supabase, safe_data, auth["user_id"])
        else:
            raise HTTPException(status_code=400, detail=str(e))
    return {"success": True, "data": result.data[0]}


@router.post("/credit-request")
async def submit_credit_request(req: CreditRequestCreate, auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    students = supabase.table("student_profiles").select("id").eq("user_id", auth["user_id"]).execute()
    if not students.data:
        raise HTTPException(status_code=400, detail="Complete your profile first")
    student = students.data[0]
    active = supabase.table("credit_applications").select("id").eq("student_id", student["id"]).in_("status", ["pending", "under_review", "scoring_done", "matched", "contract_proposed", "active"]).execute()
    if active.data:
        raise HTTPException(status_code=400, detail="You already have an active application")
    result = supabase.table("credit_applications").insert({
        "student_id": student["id"],
        "requested_monthly_amount": req.requested_monthly_amount,
        "requested_duration_months": req.requested_duration_months,
        "justification": req.justification,
        "status": "pending",
    }).execute()
    return {"success": True, "data": result.data[0]}


@router.get("/credit-request")
async def get_credit_request(auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    students = supabase.table("student_profiles").select("id").eq("user_id", auth["user_id"]).execute()
    if not students.data:
        return {"success": True, "data": None}
    result = supabase.table("credit_applications").select("*").eq("student_id", students.data[0]["id"]).order("created_at", desc=True).limit(1).execute()
    return {"success": True, "data": result.data[0] if result.data else None}


@router.get("/documents")
async def list_documents(auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    result = supabase.table("documents").select("*").eq("uploaded_by", auth["user_id"]).execute()
    return {"success": True, "data": result.data}


@router.get("/contract")
async def get_contract(auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    students = supabase.table("student_profiles").select("id").eq("user_id", auth["user_id"]).execute()
    if not students.data:
        return {"success": True, "data": None}
    result = supabase.table("contracts").select("*").eq("student_id", students.data[0]["id"]).order("created_at", desc=True).limit(1).execute()
    return {"success": True, "data": result.data[0] if result.data else None}


@router.post("/contract/{contract_id}/accept")
async def accept_contract(contract_id: str, auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    result = supabase.table("contracts").update({"status": "accepted", "accepted_at": "now()"}).eq("id", contract_id).execute()
    return {"success": True, "data": result.data[0]}


@router.post("/contract/{contract_id}/refuse")
async def refuse_contract(contract_id: str, auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    result = supabase.table("contracts").update({"status": "terminated"}).eq("id", contract_id).execute()
    supabase.table("credit_applications").update({"status": "contract_refused"}).eq("id", result.data[0]["application_id"]).execute()
    return {"success": True, "data": result.data[0]}


@router.get("/payments")
async def list_payments(auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    students = supabase.table("student_profiles").select("id").eq("user_id", auth["user_id"]).execute()
    if not students.data:
        return {"success": True, "data": []}
    contracts = supabase.table("contracts").select("id").eq("student_id", students.data[0]["id"]).execute()
    ids = [c["id"] for c in contracts.data] if contracts.data else []
    if not ids:
        return {"success": True, "data": []}
    result = supabase.table("payments").select("*").in_("contract_id", ids).order("due_date", desc=True).execute()
    return {"success": True, "data": result.data}


@router.get("/notifications")
async def list_notifications(auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    result = supabase.table("notifications").select("*").eq("user_id", auth["user_id"]).order("created_at", desc=True).limit(20).execute()
    return {"success": True, "data": result.data}
