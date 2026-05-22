from fastapi import Header, HTTPException, Depends
from supabase import create_client
from app.config import settings
from typing import Optional


def verify_token(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ", 1)[1]

    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    try:
        user = supabase.auth.get_user(token)
        return {"user_id": user.user.id, "email": user.user.email}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def admin_only(auth: dict = Depends(verify_token)) -> dict:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    result = supabase.table("profiles").select("role").eq("id", auth["user_id"]).single().execute()
    if result.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return auth


def company_only(auth: dict = Depends(verify_token)) -> dict:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    result = supabase.table("profiles").select("role").eq("id", auth["user_id"]).single().execute()
    if result.data.get("role") != "company":
        raise HTTPException(status_code=403, detail="Company access required")
    return auth
