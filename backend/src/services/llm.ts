import OpenAI from "openai";
import { config } from "../config";
import { parseJsonResponse } from "../utils/helpers";

const client = new OpenAI({
  apiKey: config.deepseekApiKey,
  baseURL: config.llmBaseUrl,
});

async function callLlm(system: string, prompt: string, maxTokens: number = 2000): Promise<string> {
  const response = await client.chat.completions.create({
    model: config.llmModel,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });
  return response.choices[0].message.content || "";
}

export async function scoreStudent(
  profile: Record<string, any>,
  justification: string,
  documentsText?: Record<string, any> | null,
): Promise<Record<string, any>> {
  const system =
    "You are an AI evaluator for a student credit platform. " +
    "Score students based on academic performance, field potential, " +
    "motivation, and personal situation. " +
    "Always respond with valid JSON only, no markdown fences.";
  const prompt = `
Evaluate this student for a study credit program.

Student Profile:
- School: ${profile.school_name || "N/A"}
- Field: ${profile.field_of_study || "N/A"}
- Year: ${profile.current_year || "N/A"}
- GPA: ${profile.gpa || "N/A"}/20
- City: ${profile.city || "N/A"}
- Bio: ${profile.bio || "N/A"}

Justification: ${justification}

Documents extracted: ${documentsText ? JSON.stringify(documentsText) : "N/A"}

Score using this rubric:
- Academic (40%): GPA, school reputation, year consistency
- Field Potential (25%): job market demand for this field
- Motivation (20%): strength of justification, career clarity
- Situation (15%): personal context, need level

Return JSON with: total_score, breakdown (object with 4 keys), rationale, risk_flags (array), recommendation (strong_recommend / recommend / cautious / reject)
`;
  const raw = await callLlm(system, prompt);
  return parseJsonResponse(raw);
}

export async function matchStudentToNeeds(
  studentData: Record<string, any>,
  scoreData: Record<string, any>,
  companyNeeds: Record<string, any>[],
): Promise<Record<string, any>[]> {
  const system =
    "You are an AI matching specialist. Match students to company needs " +
    "based on compatibility. Return JSON with matches array sorted by score descending.";
  const prompt = `
Student: ${JSON.stringify(studentData)}
Score: ${JSON.stringify(scoreData)}

Open company needs: ${JSON.stringify(companyNeeds)}

Return JSON: { matches: [ { need_id, company_name, compatibility_score, rationale, concerns } ] }
`;
  const raw = await callLlm(system, prompt, 3000);
  const result = parseJsonResponse(raw);
  return result.matches || [];
}

export async function extractDocumentData(fileContent: string, docType: string): Promise<Record<string, any>> {
  const system = "Extract structured data from this document. Return JSON only.";
  const prompt = `
Extract information from this ${docType} document:

${fileContent.slice(0, 10000)}

Return a JSON object with the relevant extracted fields.
`;
  const raw = await callLlm(system, prompt, 1500);
  return parseJsonResponse(raw);
}

export async function extractImageData(base64Image: string, docType: string): Promise<Record<string, any>> {
  const response = await client.chat.completions.create({
    model: config.llmModel,
    max_tokens: 1500,
    messages: [
      {
        role: "system",
        content: "Extract all visible text and data from this document image. Return JSON.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract all information from this ${docType} document as JSON.`,
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
  });
  return parseJsonResponse(response.choices[0].message.content || "");
}

export async function generateContractText(
  studentName: string,
  companyName: string,
  monthlyAmount: number,
  durationMonths: number,
  totalCredit: number,
  commission: number,
  workMonths: number,
  estimatedSalary: number,
): Promise<string> {
  const system = "You are a legal contract generator. Write contracts in French.";
  const prompt = `
Generate a tripartite study credit contract in French with these terms:

Student: ${studentName}
Company: ${companyName}
Monthly credit: ${monthlyAmount} MAD
Duration: ${durationMonths} months
Total credit: ${totalCredit} MAD
Commission: ${commission} MAD
Work obligation: ${workMonths} months after graduation
Estimated salary: ${estimatedSalary} MAD

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
`;
  return callLlm(system, prompt, 4000);
}

export async function analyzeSemesterReport(
  gradesData: Record<string, any>,
  gpa: number,
  threshold: number = 10.0,
): Promise<Record<string, any>> {
  const system = "Analyze semester reports and flag academic risks. Return JSON.";
  const prompt = `
Analyze this semester report:
Grades: ${JSON.stringify(gradesData)}
GPA: ${gpa}/20
Threshold: ${threshold}/20

Return JSON: { calculated_gpa, is_below_threshold, trend, risk_level (low/medium/high), summary, suggested_actions }
`;
  const raw = await callLlm(system, prompt);
  return parseJsonResponse(raw);
}
