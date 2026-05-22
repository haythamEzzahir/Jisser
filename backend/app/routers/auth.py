from fastapi import APIRouter, HTTPException, Depends
from app.database import get_supabase, get_anon_client
from app.models.schemas import RegisterRequest, LoginRequest
from app.dependencies import verify_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def register(req: RegisterRequest):
    try:
        supabase = get_anon_client()
        result = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {
                "data": {
                    "full_name": req.full_name,
                    "role": req.role.value,
                }
            }
        })
        if not result.user:
            raise HTTPException(status_code=400, detail="Registration failed")
        return {"success": True, "data": {"user_id": result.user.id}}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(req: LoginRequest):
    try:
        supabase = get_anon_client()
        result = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
        return {"success": True, "data": {
            "access_token": result.session.access_token,
            "refresh_token": result.session.refresh_token,
            "user": {
                "id": result.user.id,
                "email": result.user.email,
                "role": result.user.user_metadata.get("role"),
                "full_name": result.user.user_metadata.get("full_name"),
            }
        }}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/me")
async def get_me(auth: dict = Depends(verify_token)):
    supabase = get_supabase()
    profile = supabase.table("profiles").select("*").eq("id", auth["user_id"]).single().execute()
    return {"success": True, "data": profile.data}
