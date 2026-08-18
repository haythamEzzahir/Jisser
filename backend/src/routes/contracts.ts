import { Router, Request, Response } from "express";
import { verifyToken } from "../middleware/auth";
import { supabase } from "../database";

const router = Router();

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", req.params.id);
    if (error) return res.status(400).json({ detail: error.message });
    if (!data || data.length === 0) {
      return res.status(404).json({ detail: "Contract not found" });
    }
    return res.json({ success: true, data: data[0] });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

export default router;
