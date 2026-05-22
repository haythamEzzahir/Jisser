from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.database import get_supabase
from app.services.documents import process_document_upload
from app.dependencies import verify_token
import base64

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    doc_type: str = Form(...),
    related_to: str = Form(None),
    file: UploadFile = File(...),
    auth: dict = Depends(verify_token),
):
    supabase = get_supabase()
    content = await file.read()
    file_name = f"{auth['user_id']}/{doc_type}_{file.filename}"

    storage = supabase.storage.from_("documents")
    storage.upload(file_name, content, {"content-type": file.content_type or "application/octet-stream"})

    public_url = storage.get_public_url(file_name)

    result = supabase.table("documents").insert({
        "uploaded_by": auth["user_id"],
        "related_to": related_to,
        "doc_type": doc_type,
        "file_name": file.filename,
        "file_path": file_name,
        "file_size": len(content),
        "mime_type": file.content_type,
    }).execute()

    doc_id = result.data[0]["id"]
    is_image = file.content_type and file.content_type.startswith("image/")
    if is_image:
        b64 = base64.b64encode(content).decode("utf-8")
        try:
            await process_document_upload(doc_id, b64, doc_type, is_image=True)
        except Exception:
            pass

    return {"success": True, "data": {"id": doc_id, "url": public_url}}
