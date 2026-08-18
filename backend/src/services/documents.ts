import { supabase } from "../database";
import { extractDocumentData, extractImageData } from "./llm";

export async function processDocumentUpload(
  documentId: string,
  fileContent: string,
  docType: string,
  isImage: boolean = false,
): Promise<Record<string, any>> {
  try {
    const result = isImage
      ? await extractImageData(fileContent, docType)
      : await extractDocumentData(fileContent, docType);

    await supabase
      .from("documents")
      .update({
        ai_extracted_data: result,
      })
      .eq("id", documentId);

    return result;
  } catch (e: any) {
    return { error: e.message };
  }
}
