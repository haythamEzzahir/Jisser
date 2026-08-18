import { supabase } from "../database";
import { scoreStudent } from "./llm";

export async function triggerScoring(applicationId: string): Promise<Record<string, any>> {
  const app = await supabase
    .from("credit_applications")
    .select("*")
    .eq("id", applicationId);

  if (!app.data || app.data.length === 0) {
    throw new Error("Application not found");
  }
  const appData = app.data[0];

  const student = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", appData.student_id);

  const profile = student.data && student.data.length > 0 ? student.data[0] : {};

  const documents = await supabase
    .from("documents")
    .select("*")
    .eq("related_to", applicationId);

  const docsText: Record<string, any> = {};
  for (const doc of documents.data || []) {
    if (doc.ai_extracted_data) {
      docsText[doc.doc_type] = doc.ai_extracted_data;
    }
  }

  const result = await scoreStudent(
    profile,
    appData.justification || "",
    Object.keys(docsText).length > 0 ? docsText : null,
  );

  await supabase
    .from("credit_applications")
    .update({
      ai_score: result.total_score,
      ai_score_breakdown: result.breakdown,
      ai_scoring_rationale: result.rationale,
      status: "scoring_done",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  return result;
}
