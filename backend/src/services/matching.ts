import { supabase } from "../database";
import { matchStudentToNeeds } from "./llm";

export async function getMatchSuggestions(applicationId: string): Promise<Record<string, any>[]> {
  const app = await supabase
    .from("credit_applications")
    .select("*")
    .eq("id", applicationId);

  if (!app.data || app.data.length === 0 || !app.data[0].ai_score) {
    throw new Error("Application must be scored first");
  }
  const appData = app.data[0];

  const student = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", appData.student_id);

  const needs = await supabase
    .from("company_needs")
    .select("*, company_profiles!inner(company_name, sector)")
    .eq("status", "open");

  const result = await matchStudentToNeeds(
    { ...(student.data?.[0] || {}), justification: appData.justification },
    {
      total_score: appData.ai_score,
      breakdown: appData.ai_score_breakdown,
    },
    needs.data || [],
  );

  return result;
}
