import { Router, Request, Response } from "express";
import { verifyToken, requireRole } from "../middleware/auth";
import { supabase } from "../database";
import { triggerScoring } from "../services/scoring";
import { getMatchSuggestions } from "../services/matching";
import { generateContract } from "../services/contracts";
import type { MatchConfirmInput } from "../types";

const router = Router();

const admin = [verifyToken, requireRole("admin")];

router.get("/dashboard", ...admin, async (_req: Request, res: Response) => {
  try {
    const { data: apps } = await supabase.from("credit_applications").select("*");
    const { data: companies } = await supabase.from("company_profiles").select("id");
    const { data: contracts } = await supabase.from("contracts").select("id, status, company_investment_total");
    const list = apps || [];
    const totalApps = list.length;
    const pending = list.filter((a) => a.status === "pending").length;
    const scored = list.filter((a) => a.status === "scoring_done").length;
    const activeContracts = (contracts || []).filter((c) => c.status === "active").length;
    const totalInvested = (contracts || [])
      .filter((c) => c.status === "active" || c.status === "completed")
      .reduce((sum, c) => sum + parseFloat(c.company_investment_total || "0"), 0);
    return res.json({
      success: true,
      data: {
        total_applications: totalApps,
        pending_review: pending,
        scored,
        active_contracts: activeContracts,
        total_companies: (companies || []).length,
        total_invested: totalInvested,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/applications", ...admin, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from("credit_applications")
      .select("*, student_profiles!inner(*, profiles!inner(full_name, email))")
      .order("created_at", { ascending: false });
    if (status) {
      query = query.eq("status", status as string);
    }
    const { data, error } = await query;
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/applications/:id", ...admin, async (req: Request, res: Response) => {
  try {
    const { data: app, error } = await supabase
      .from("credit_applications")
      .select("*, student_profiles!inner(*, profiles!inner(full_name, email))")
      .eq("id", req.params.id);
    if (error) return res.status(400).json({ detail: error.message });
    if (!app || app.length === 0) {
      return res.status(404).json({ detail: "Application not found" });
    }
    const { data: docs } = await supabase
      .from("documents")
      .select("*")
      .eq("related_to", req.params.id);
    return res.json({ success: true, data: { ...app[0], documents: docs || [] } });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.post("/applications/:id/score", ...admin, async (req: Request, res: Response) => {
  try {
    const result = await triggerScoring(req.params.id);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post("/applications/:id/reject", ...admin, async (req: Request, res: Response) => {
  try {
    const reason = req.body.reason || "";
    const { data, error } = await supabase
      .from("credit_applications")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_by: req.user!.user_id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.post("/applications/:id/approve", ...admin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("credit_applications")
      .update({
        status: "scoring_done",
        reviewed_by: req.user!.user_id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.put("/applications/:id/notes", ...admin, async (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    if (notes === undefined) {
      return res.status(400).json({ detail: "notes field required" });
    }
    const { data, error } = await supabase
      .from("credit_applications")
      .update({ admin_notes: notes })
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/matching/suggestions/:id", ...admin, async (req: Request, res: Response) => {
  try {
    const suggestions = await getMatchSuggestions(req.params.id);
    return res.json({ success: true, data: suggestions });
  } catch (err: any) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post("/matching/confirm", ...admin, async (req: Request, res: Response) => {
  try {
    const { application_id, need_id }: MatchConfirmInput = req.body;
    if (!application_id || !need_id) {
      return res.status(400).json({ detail: "application_id and need_id required" });
    }
    const { data: existing } = await supabase
      .from("matches")
      .select("id")
      .eq("application_id", application_id);
    if (existing && existing.length > 0) {
      return res.status(400).json({ detail: "Already matched" });
    }
    const { data, error } = await supabase
      .from("matches")
      .insert({ application_id, need_id, matched_by: req.user!.user_id })
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    await supabase
      .from("credit_applications")
      .update({ status: "matched" })
      .eq("id", application_id);
    await supabase
      .from("company_needs")
      .update({ status: "matched" })
      .eq("id", need_id);
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.post("/contracts/generate", ...admin, async (req: Request, res: Response) => {
  try {
    const { match_id, application_id } = req.body;
    if (!match_id || !application_id) {
      return res.status(400).json({ detail: "match_id and application_id required" });
    }
    const result = await generateContract(match_id, application_id);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post("/contracts/:id/propose", ...admin, async (req: Request, res: Response) => {
  try {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 15);
    const { data, error } = await supabase
      .from("contracts")
      .update({
        status: "proposed",
        proposed_at: new Date().toISOString(),
        student_response_deadline: deadline.toISOString(),
      })
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    if (data && data.length > 0) {
      await supabase
        .from("credit_applications")
        .update({ status: "contract_proposed" })
        .eq("id", data[0].application_id);
    }
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/contracts", ...admin, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/payments", ...admin, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*, contracts!inner(monthly_amount, status)")
      .order("due_date", { ascending: false });
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.post("/payments/generate-schedule", ...admin, async (req: Request, res: Response) => {
  try {
    const { contract_id } = req.body;
    if (!contract_id) return res.status(400).json({ detail: "contract_id required" });
    const { data: contracts, error: findErr } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contract_id);
    if (findErr) return res.status(400).json({ detail: findErr.message });
    if (!contracts || contracts.length === 0) {
      return res.status(404).json({ detail: "Contract not found" });
    }
    const contract = contracts[0];
    const monthly = parseFloat(contract.monthly_amount);
    const duration = parseInt(contract.duration_months, 10);
    const today = new Date();
    const payments = [];
    for (let i = 0; i < duration; i++) {
      const totalMonths = today.getMonth() + i;
      const year = today.getFullYear() + Math.floor(totalMonths / 12);
      const month = totalMonths % 12;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const due = new Date(year, month, lastDay);
      payments.push({
        contract_id,
        direction: "platform_to_student" as const,
        amount: monthly,
        due_date: due.toISOString().split("T")[0],
      });
    }
    for (const p of payments) {
      await supabase.from("payments").insert(p);
    }
    const companyPayment = {
      contract_id,
      direction: "company_to_platform" as const,
      amount: parseFloat(contract.company_investment_total),
      due_date: today.toISOString().split("T")[0],
    };
    await supabase.from("payments").insert(companyPayment);
    return res.json({
      success: true,
      data: { payments_generated: payments.length + 1 },
    });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.post("/payments/:id/mark-paid", ...admin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .update({
        status: "paid",
        paid_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/semester-reports", ...admin, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("semester_reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/companies", ...admin, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("company_profiles")
      .select("*, profiles!inner(full_name, email)");
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.post("/companies/:id/verify", ...admin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("company_profiles")
      .update({ verified: true })
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

export default router;
