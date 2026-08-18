import { Router, Request, Response } from "express";
import { verifyToken, requireRole } from "../middleware/auth";
import { supabase } from "../database";
import type { CompanyProfileInput, CompanyNeedInput } from "../types";

const router = Router();

router.get("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", req.user!.user_id);
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data && data.length > 0 ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.put("/profile", verifyToken, requireRole("company"), async (req: Request, res: Response) => {
  try {
    const body: CompanyProfileInput = req.body;
    const clean = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== null && v !== undefined)
    );
    const { data: existing } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", req.user!.user_id);
    let result;
    if (existing && existing.length > 0) {
      const { data } = await supabase
        .from("company_profiles")
        .update(clean)
        .eq("user_id", req.user!.user_id)
        .select();
      result = data;
    } else {
      const { data } = await supabase
        .from("company_profiles")
        .insert({ user_id: req.user!.user_id, ...clean })
        .select();
      result = data;
    }
    return res.json({ success: true, data: result ? result[0] : null });
  } catch (err: any) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post("/needs", verifyToken, requireRole("company"), async (req: Request, res: Response) => {
  try {
    const body: CompanyNeedInput = req.body;
    const { data: companies, error: compErr } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", req.user!.user_id);
    if (compErr) return res.status(400).json({ detail: compErr.message });
    if (!companies || companies.length === 0) {
      return res.status(400).json({ detail: "Complete your company profile first" });
    }
    const { data, error } = await supabase
      .from("company_needs")
      .insert({ company_id: companies[0].id, ...body })
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/needs", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data: companies } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", req.user!.user_id);
    if (!companies || companies.length === 0) {
      return res.json({ success: true, data: [] });
    }
    const { data, error } = await supabase
      .from("company_needs")
      .select("*")
      .eq("company_id", companies[0].id)
      .order("created_at", { ascending: false });
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.put("/needs/:id", verifyToken, requireRole("company"), async (req: Request, res: Response) => {
  try {
    const body: Partial<CompanyNeedInput> = req.body;
    const { data, error } = await supabase
      .from("company_needs")
      .update(body)
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/assigned-students", verifyToken, requireRole("company"), async (req: Request, res: Response) => {
  try {
    const { data: companies } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", req.user!.user_id);
    if (!companies || companies.length === 0) {
      return res.json({ success: true, data: [] });
    }
    const { data, error } = await supabase
      .from("contracts")
      .select("*, student_profiles!inner(*, profiles!inner(full_name, email))")
      .eq("company_id", companies[0].id)
      .in("status", ["active", "completed"]);
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/payments", verifyToken, requireRole("company"), async (req: Request, res: Response) => {
  try {
    const { data: companies } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", req.user!.user_id);
    if (!companies || companies.length === 0) {
      return res.json({ success: true, data: [] });
    }
    const { data: contracts } = await supabase
      .from("contracts")
      .select("id")
      .eq("company_id", companies[0].id);
    const ids = contracts ? contracts.map((c) => c.id) : [];
    if (ids.length === 0) return res.json({ success: true, data: [] });
    const { data } = await supabase
      .from("payments")
      .select("*")
      .in("contract_id", ids)
      .order("due_date", { ascending: false });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/roi", verifyToken, requireRole("company"), async (req: Request, res: Response) => {
  try {
    const { data: companies } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("user_id", req.user!.user_id);
    if (!companies || companies.length === 0) {
      return res.json({ success: true, data: null });
    }
    const { data: contracts } = await supabase
      .from("contracts")
      .select("*")
      .eq("company_id", companies[0].id);
    const list = contracts || [];
    const totalInvested = list.reduce(
      (sum, c) => sum + parseFloat(c.company_investment_total || "0"),
      0
    );
    const active = list.filter((c) => c.status === "active").length;
    const completed = list.filter((c) => c.status === "completed").length;
    const totalSalarySaved = completed * 120000;
    return res.json({
      success: true,
      data: {
        total_invested: totalInvested,
        active_contracts: active,
        completed_contracts: completed,
        estimated_roi: totalInvested > 0 ? totalSalarySaved - totalInvested : 0,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/notifications", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.user!.user_id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

export default router;
