from openai import OpenAI
from app.config import settings
from app.utils.helpers import parse_json_response
from typing import Optional


client = OpenAI(
    api_key=settings.DEEPSEEK_API_KEY,
    base_url=settings.LLM_BASE_URL,
)


def _call_llm(system: str, prompt: str, max_tokens: int = 2000) -> str:
    response = client.chat.completions.create(
        model=settings.LLM_MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
    )
    return response.choices[0].message.content


def score_student(
    profile: dict,
    justification: str,
    documents_text: Optional[dict] = None,
) -> dict:
    system = (
        "You are an AI evaluator for a student credit platform. "
        "Score students based on academic performance, field potential, "
        "motivation, and personal situation. "
        "Always respond with valid JSON only, no markdown fences."
    )
    prompt = f"""
Evaluate this student for a study credit program.

Student Profile:
- School: {profile.get('school_name', 'N/A')}
- Field: {profile.get('field_of_study', 'N/A')}
- Year: {profile.get('current_year', 'N/A')}
- GPA: {profile.get('gpa', 'N/A')}/20
- City: {profile.get('city', 'N/A')}
- Bio: {profile.get('bio', 'N/A')}

Justification: {justification}

Documents extracted: {documents_text or 'N/A'}

Score using this rubric:
- Academic (40%): GPA, school reputation, year consistency
- Field Potential (25%): job market demand for this field
- Motivation (20%): strength of justification, career clarity
- Situation (15%): personal context, need level

Return JSON with: total_score, breakdown (object with 4 keys), rationale, risk_flags (array), recommendation (strong_recommend / recommend / cautious / reject)
"""
    raw = _call_llm(system, prompt)
    return parse_json_response(raw)


def match_student_to_needs(
    student_data: dict,
    score_data: dict,
    company_needs: list[dict],
) -> list[dict]:
    system = (
        "You are an AI matching specialist. Match students to company needs "
        "based on compatibility. Return JSON with matches array sorted by score descending."
    )
    prompt = f"""
Student: {student_data}
Score: {score_data}

Open company needs: {company_needs}

Return JSON: {{ matches: [{{ need_id, company_name, compatibility_score, rationale, concerns }}] }}
"""
    raw = _call_llm(system, prompt, max_tokens=3000)
    result = parse_json_response(raw)
    return result.get("matches", [])


def extract_document_data(file_content: str, doc_type: str) -> dict:
    system = "Extract structured data from this document. Return JSON only."
    prompt = f"""
Extract information from this {doc_type} document:

{file_content[:10000]}

Return a JSON object with the relevant extracted fields.
"""
    raw = _call_llm(system, prompt, max_tokens=1500)
    return parse_json_response(raw)


def extract_image_data(base64_image: str, doc_type: str) -> dict:
    response = client.chat.completions.create(
        model=settings.LLM_MODEL,
        max_tokens=1500,
        messages=[
            {"role": "system", "content": "Extract all visible text and data from this document image. Return JSON."},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"Extract all information from this {doc_type} document as JSON."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                ],
            },
        ],
    )
    return parse_json_response(response.choices[0].message.content)


def generate_contract_text(
    student_name: str,
    company_name: str,
    monthly_amount: float,
    duration_months: int,
    total_credit: float,
    commission: float,
    work_months: int,
    estimated_salary: float,
) -> str:
    system = "You are a legal contract generator. Write contracts in French."
    prompt = f"""
Generate a tripartite study credit contract in French with these terms:

Student: {student_name}
Company: {company_name}
Monthly credit: {monthly_amount} MAD
Duration: {duration_months} months
Total credit: {total_credit} MAD
Commission: {commission} MAD
Work obligation: {work_months} months after graduation
Estimated salary: {estimated_salary} MAD

Include sections:
1. Parties
2. Objet du contrat
3. Montant et modalités de financement
4. Engagement professionnel
5. Obligations de l'étudiant
6. Obligations de l'entreprise
7. Clause de rachat (buyout): remaining_amount × 1.20
8. Résiliation
9. Durée
10. Signatures

Return the full contract text in French.
"""
    return _call_llm(system, prompt, max_tokens=4000)


def analyze_semester_report(grades_data: dict, gpa: float, threshold: float = 10.0) -> dict:
    system = "Analyze semester reports and flag academic risks. Return JSON."
    prompt = f"""
Analyze this semester report:
Grades: {grades_data}
GPA: {gpa}/20
Threshold: {threshold}/20

Return JSON: {{ calculated_gpa, is_below_threshold, trend, risk_level (low/medium/high), summary, suggested_actions }}
"""
    raw = _call_llm(system, prompt)
    return parse_json_response(raw)
