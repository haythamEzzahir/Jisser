import { supabase } from "../database";
import { generateContractText } from "./llm";
import { RULES, calculateTotalCredit, calculateCommission, calculateCompanyInvestment } from "../utils/business-rules";

export async function generateContract(matchId: string, applicationId: string): Promise<Record<string, any>> {
  const match = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId);

  if (!match.data || match.data.length === 0) {
    throw new Error("Match not found");
  }
  const matchData = match.data[0];

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

  const studentData = student.data?.[0] || {};

  const profile = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", studentData.user_id);

  const need = await supabase
    .from("company_needs")
    .select("*")
    .eq("id", matchData.need_id);

  const needData = need.data?.[0] || {};

  const company = await supabase
    .from("company_profiles")
    .select("*")
    .eq("id", needData.company_id);

  const companyData = company.data?.[0] || {};

  const companyProfile = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", companyData.user_id);

  const monthly = parseFloat(appData.requested_monthly_amount);
  const duration = parseInt(appData.requested_duration_months);
  const total = calculateTotalCredit(monthly, duration);
  const commission = calculateCommission(monthly, duration);
  const investment = calculateCompanyInvestment(monthly, duration);
  const workMonths = RULES.min_work_duration_months;
  const salary = needData.investment_budget
    ? parseFloat(needData.investment_budget) / workMonths
    : null;

  const contractText = await generateContractText(
    profile.data?.[0]?.full_name || "Étudiant",
    companyData.company_name,
    monthly,
    duration,
    total,
    commission,
    workMonths,
    salary || 0,
  );

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + RULES.contract_response_deadline_days);

  const result = await supabase
    .from("contracts")
    .insert({
      match_id: matchId,
      application_id: applicationId,
      student_id: appData.student_id,
      company_id: companyData.id,
      monthly_amount: monthly,
      duration_months: duration,
      total_credit_amount: total,
      platform_commission_rate: RULES.commission_rate * 100,
      platform_commission_amount: commission,
      company_investment_total: investment,
      work_duration_months: workMonths,
      estimated_salary: salary,
      contract_text: contractText,
      status: "draft",
    });

  return result.data?.[0] || {};
}
