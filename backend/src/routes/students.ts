import { Router, Request, Response } from "express";
import { verifyToken } from "../middleware/auth";
import { supabase } from "../database";
import type { StudentProfileInput, CreditRequestInput } from "../types";

const router = Router();

async function tryUpsertProfile(data: Record<string, any>, userId: string) {
  const { data: existing } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", userId);
  if (existing && existing.length > 0) {
    const { data: result } = await supabase
      .from("student_profiles")
      .update(data)
      .eq("user_id", userId)
      .select();
    return result;
  }
  const { data: result } = await supabase
    .from("student_profiles")
    .insert({ user_id: userId, ...data })
    .select();
  return result;
}

router.get("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", req.user!.user_id);
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data && data.length > 0 ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.put("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const body: StudentProfileInput = req.body;
    const data = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== null && v !== undefined)
    );
    let result;
    try {
      result = await tryUpsertProfile(data, req.user!.user_id);
    } catch (err: any) {
      if (
        err.message &&
        (err.message.includes("education_level") || err.message.includes("extra_data"))
      ) {
        const safeData = { ...data };
        delete safeData.education_level;
        delete safeData.extra_data;
        result = await tryUpsertProfile(safeData, req.user!.user_id);
      } else {
        throw err;
      }
    }
    return res.json({ success: true, data: result ? result[0] : null });
  } catch (err: any) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post("/credit-request", verifyToken, async (req: Request, res: Response) => {
  try {
    const body: CreditRequestInput = req.body;
    const { data: students, error: studentErr } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", req.user!.user_id);
    if (studentErr) return res.status(400).json({ detail: studentErr.message });
    if (!students || students.length === 0) {
      return res.status(400).json({ detail: "Complete your profile first" });
    }
    const student = students[0];
    const { data: active } = await supabase
      .from("credit_applications")
      .select("id")
      .eq("student_id", student.id)
      .in("status", ["pending", "under_review", "scoring_done", "matched", "contract_proposed", "active"]);
    if (active && active.length > 0) {
      return res.status(400).json({ detail: "You already have an active application" });
    }
    const { data: result, error } = await supabase
      .from("credit_applications")
      .insert({
        student_id: student.id,
        requested_monthly_amount: body.requested_monthly_amount,
        requested_duration_months: body.requested_duration_months,
        justification: body.justification,
        status: "pending",
      })
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: result ? result[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/credit-request", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data: students } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", req.user!.user_id);
    if (!students || students.length === 0) {
      return res.json({ success: true, data: null });
    }
    const { data } = await supabase
      .from("credit_applications")
      .select("*")
      .eq("student_id", students[0].id)
      .order("created_at", { ascending: false })
      .limit(1);
    return res.json({ success: true, data: data && data.length > 0 ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/documents", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("uploaded_by", req.user!.user_id);
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/contract", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data: students } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", req.user!.user_id);
    if (!students || students.length === 0) {
      return res.json({ success: true, data: null });
    }
    const { data } = await supabase
      .from("contracts")
      .select("*")
      .eq("student_id", students[0].id)
      .order("created_at", { ascending: false })
      .limit(1);
    return res.json({ success: true, data: data && data.length > 0 ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.post("/contract/:id/accept", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.post("/contract/:id/refuse", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .update({ status: "terminated" })
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(400).json({ detail: error.message });
    if (data && data.length > 0) {
      await supabase
        .from("credit_applications")
        .update({ status: "contract_refused" })
        .eq("id", data[0].application_id);
    }
    return res.json({ success: true, data: data ? data[0] : null });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

router.get("/payments", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data: students } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", req.user!.user_id);
    if (!students || students.length === 0) {
      return res.json({ success: true, data: [] });
    }
    const { data: contracts } = await supabase
      .from("contracts")
      .select("id")
      .eq("student_id", students[0].id);
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
