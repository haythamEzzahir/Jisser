import { Router, Request, Response } from "express";
import { verifyToken } from "../middleware/auth";
import { supabase } from "../database";

const router = Router();

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", req.user!.user_id);
    if (!profiles || profiles.length === 0) {
      return res.json({ success: true, data: [] });
    }
    const role = profiles[0].role;
    let contractIds: string[] = [];
    if (role === "student") {
      const { data: students } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("user_id", req.user!.user_id);
      if (!students || students.length === 0) return res.json({ success: true, data: [] });
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id")
        .eq("student_id", students[0].id);
      contractIds = contracts ? contracts.map((c) => c.id) : [];
    } else if (role === "company") {
      const { data: companies } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", req.user!.user_id);
      if (!companies || companies.length === 0) return res.json({ success: true, data: [] });
      const { data: contracts } = await supabase
        .from("contracts")
        .select("id")
        .eq("company_id", companies[0].id);
      contractIds = contracts ? contracts.map((c) => c.id) : [];
    } else {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .order("due_date", { ascending: false });
      return res.json({ success: true, data: data || [] });
    }
    if (contractIds.length === 0) return res.json({ success: true, data: [] });
    const { data } = await supabase
      .from("payments")
      .select("*")
      .in("contract_id", contractIds)
      .order("due_date", { ascending: false });
    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

export default router;
