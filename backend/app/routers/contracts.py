from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase
from app.dependencies import verify_token

router = APIRouter(prefix="/api/contracts", tags=["contracts"])


@router.get("/{contract_id}")
async def get_contract(contract_id: str, auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    result = supabase.table("contracts").select("*").eq("id", contract_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "data": result.data[0]}
