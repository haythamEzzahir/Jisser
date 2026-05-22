from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase
from app.services.scoring import trigger_scoring
from app.services.matching import get_match_suggestions
from app.services.contracts import generate_contract
from app.models.schemas import MatchConfirm
from app.dependencies import admin_only
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard")
async def get_dashboard(auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    apps = supabase.table("credit_applications").select("*").execute()
    companies = supabase.table("company_profiles").select("id").execute()
    contracts = supabase.table("contracts").select("id, status").execute()
    total_apps = len(apps.data)
    pending = sum(1 for a in apps.data if a["status"] == "pending")
    scored = sum(1 for a in apps.data if a["status"] == "scoring_done")
    active_contracts = sum(1 for c in contracts.data if c["status"] == "active")
    total_invested = sum(float(c.get("company_investment_total", 0)) for c in contracts.data if c["status"] in ["active", "completed"])
    return {"success": True, "data": {
        "total_applications": total_apps,
        "pending_review": pending,
        "scored": scored,
        "active_contracts": active_contracts,
        "total_companies": len(companies.data),
        "total_invested": total_invested,
    }}


@router.get("/applications")
async def list_applications(status: str = None, auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    query = supabase.table("credit_applications").select("*, student_profiles!inner(*, profiles!inner(full_name, email))").order("created_at", desc=True)
    if status:
        query = query.eq("status", status)
    result = query.execute()
    return {"success": True, "data": result.data}


@router.get("/applications/{application_id}")
async def get_application_detail(application_id: str, auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    result = supabase.table("credit_applications").select("*, student_profiles!inner(*, profiles!inner(full_name, email))").eq("id", application_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Application not found")
    docs = supabase.table("documents").select("*").eq("related_to", application_id).execute()
    return {"success": True, "data": {**result.data[0], "documents": docs.data}}


@router.post("/applications/{application_id}/score")
async def score_application(application_id: str, auth: dict = Depends(admin_only)):
    try:
        result = await trigger_scoring(application_id)
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/applications/{application_id}/reject")
async def reject_application(application_id: str, reason: str = "", auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    result = supabase.table("credit_applications").update({
        "status": "rejected",
        "rejection_reason": reason,
        "reviewed_by": auth["user_id"],
        "reviewed_at": datetime.utcnow().isoformat(),
    }).eq("id", application_id).execute()
    return {"success": True, "data": result.data[0]}


@router.post("/applications/{application_id}/approve")
async def approve_application(application_id: str, auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    result = supabase.table("credit_applications").update({
        "status": "scoring_done",
        "reviewed_by": auth["user_id"],
        "reviewed_at": datetime.utcnow().isoformat(),
    }).eq("id", application_id).execute()
    return {"success": True, "data": result.data[0]}


@router.put("/applications/{application_id}/notes")
async def update_notes(application_id: str, notes: str, auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    result = supabase.table("credit_applications").update({"admin_notes": notes}).eq("id", application_id).execute()
    return {"success": True, "data": result.data[0]}


@router.get("/matching/suggestions/{application_id}")
async def get_matching_suggestions(application_id: str, auth: dict = Depends(admin_only)):
    try:
        suggestions = await get_match_suggestions(application_id)
        return {"success": True, "data": suggestions}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/matching/confirm")
async def confirm_match(match: MatchConfirm, auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    existing = supabase.table("matches").select("id").eq("application_id", match.application_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Already matched")
    result = supabase.table("matches").insert({
        "application_id": match.application_id,
        "need_id": match.need_id,
        "matched_by": auth["user_id"],
    }).execute()
    supabase.table("credit_applications").update({"status": "matched"}).eq("id", match.application_id).execute()
    supabase.table("company_needs").update({"status": "matched"}).eq("id", match.need_id).execute()
    return {"success": True, "data": result.data[0]}


@router.post("/contracts/generate")
async def generate_contract_route(match_id: str, application_id: str, auth: dict = Depends(admin_only)):
    try:
        result = await generate_contract(match_id, application_id)
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/contracts/{contract_id}/propose")
async def propose_contract(contract_id: str, auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    from datetime import timedelta
    deadline = datetime.utcnow() + timedelta(days=15)
    result = supabase.table("contracts").update({
        "status": "proposed",
        "proposed_at": datetime.utcnow().isoformat(),
        "student_response_deadline": deadline.isoformat(),
    }).eq("id", contract_id).execute()
    supabase.table("credit_applications").update({"status": "contract_proposed"}).eq("id", result.data[0]["application_id"]).execute()
    return {"success": True, "data": result.data[0]}


@router.get("/contracts")
async def list_contracts(auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    result = supabase.table("contracts").select("*").order("created_at", desc=True).execute()
    return {"success": True, "data": result.data}


@router.get("/payments")
async def list_payments(auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    result = supabase.table("payments").select("*, contracts!inner(monthly_amount, status)").order("due_date", desc=True).execute()
    return {"success": True, "data": result.data}


@router.post("/payments/generate-schedule")
async def generate_payment_schedule(contract_id: str, auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    result = supabase.table("contracts").select("*").eq("id", contract_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Contract not found")
    contract = result.data[0]
    monthly = float(contract["monthly_amount"])
    duration = int(contract["duration_months"])
    from datetime import date, timedelta
    import calendar
    today = date.today()
    payments = []
    for i in range(duration):
        month = today.month + i
        year = today.year + (month - 1) // 12
        month = ((month - 1) % 12) + 1
        last_day = calendar.monthrange(year, month)[1]
        due = date(year, month, last_day)
        payments.append({
            "contract_id": contract_id,
            "direction": "platform_to_student",
            "amount": monthly,
            "due_date": due.isoformat(),
        })
    for p in payments:
        supabase.table("payments").insert(p).execute()
    company_payment = {
        "contract_id": contract_id,
        "direction": "company_to_platform",
        "amount": float(contract.data["company_investment_total"]),
        "due_date": today.isoformat(),
    }
    supabase.table("payments").insert(company_payment).execute()
    return {"success": True, "data": {"payments_generated": len(payments) + 1}}


@router.post("/payments/{payment_id}/mark-paid")
async def mark_paid(payment_id: str, auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    from datetime import date
    result = supabase.table("payments").update({
        "status": "paid",
        "paid_date": date.today().isoformat(),
    }).eq("id", payment_id).execute()
    return {"success": True, "data": result.data[0]}


@router.get("/semester-reports")
async def list_semester_reports(auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    result = supabase.table("semester_reports").select("*").order("created_at", desc=True).execute()
    return {"success": True, "data": result.data}


@router.get("/companies")
async def list_companies(auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    result = supabase.table("company_profiles").select("*, profiles!inner(full_name, email)").execute()
    return {"success": True, "data": result.data}


@router.post("/companies/{company_id}/verify")
async def verify_company(company_id: str, auth: dict = Depends(admin_only)):
    supabase = get_supabase()
    result = supabase.table("company_profiles").update({"verified": True}).eq("id", company_id).execute()
    return {"success": True, "data": result.data[0]}
