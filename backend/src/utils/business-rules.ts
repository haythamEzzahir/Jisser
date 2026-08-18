export const RULES = {
  commission_rate: 0.10,
  default_gpa_threshold: 10.0,
  buyout_margin: 0.20,
  insurance_contribution_rate: 0.03,
  insurance_reimbursement_min: 0.50,
  insurance_reimbursement_max: 0.70,
  min_work_duration_months: 24,
  max_work_duration_months: 36,
  min_salary_multiplier: 1.20,
  max_active_applications: 1,
  reapplication_cooldown_days: 180,
  contract_response_deadline_days: 15,
  contract_reminder_days_before: 5,
};

export function calculateCommission(monthlyAmount: number, durationMonths: number): number {
  return parseFloat((monthlyAmount * durationMonths * RULES.commission_rate).toFixed(2));
}

export function calculateTotalCredit(monthlyAmount: number, durationMonths: number): number {
  return parseFloat((monthlyAmount * durationMonths).toFixed(2));
}

export function calculateCompanyInvestment(monthlyAmount: number, durationMonths: number): number {
  const total = calculateTotalCredit(monthlyAmount, durationMonths);
  const commission = calculateCommission(monthlyAmount, durationMonths);
  return parseFloat((total + commission).toFixed(2));
}

export function calculateBuyout(remainingMonths: number, monthlyAmount: number): number {
  const remaining = remainingMonths * monthlyAmount;
  return parseFloat((remaining * (1 + RULES.buyout_margin)).toFixed(2));
}

export function validateSalary(salary: number, smig: number = 3000): boolean {
  return salary >= smig * RULES.min_salary_multiplier;
}
