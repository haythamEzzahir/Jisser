RULES = {
    "commission_rate": 0.10,
    "default_gpa_threshold": 10.0,
    "buyout_margin": 0.20,
    "insurance_contribution_rate": 0.03,
    "insurance_reimbursement_min": 0.50,
    "insurance_reimbursement_max": 0.70,
    "min_work_duration_months": 24,
    "max_work_duration_months": 36,
    "min_salary_multiplier": 1.20,
    "max_active_applications": 1,
    "reapplication_cooldown_days": 180,
    "contract_response_deadline_days": 15,
    "contract_reminder_days_before": 5,
}


def calculate_commission(monthly_amount: float, duration_months: int) -> float:
    total = monthly_amount * duration_months
    commission = total * RULES["commission_rate"]
    return round(commission, 2)


def calculate_total_credit(monthly_amount: float, duration_months: int) -> float:
    return round(monthly_amount * duration_months, 2)


def calculate_company_investment(monthly_amount: float, duration_months: int) -> float:
    total = calculate_total_credit(monthly_amount, duration_months)
    commission = calculate_commission(monthly_amount, duration_months)
    return round(total + commission, 2)


def calculate_buyout(remaining_months: int, monthly_amount: float) -> float:
    remaining = remaining_months * monthly_amount
    buyout = remaining * (1 + RULES["buyout_margin"])
    return round(buyout, 2)


def validate_salary(salary: float, smig: float = 3000) -> bool:
    return salary >= smig * RULES["min_salary_multiplier"]
