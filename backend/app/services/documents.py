from app.services.llm import extract_document_data, extract_image_data
from app.database import get_supabase
import base64


async def process_document_upload(document_id: str, file_content: str, doc_type: str, is_image: bool = False):
    try:
        if is_image:
            result = await extract_image_data(file_content, doc_type)
        else:
            result = await extract_document_data(file_content, doc_type)

        supabase = get_supabase()
        supabase.table("documents").update({
            "ai_extracted_data": result,
        }).eq("id", document_id).execute()

        return result
    except Exception as e:
        return {"error": str(e)}
