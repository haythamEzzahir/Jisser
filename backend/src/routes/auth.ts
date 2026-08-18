import { Router, Request, Response } from "express";
import { verifyToken, login, register, getProfile } from "../middleware/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ detail: "Missing required fields" });
    }
    await register(email, password, full_name, role);
    return res.json({ success: true, data: { email } });
  } catch (err: any) {
    return res.status(400).json({ detail: err.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ detail: "Email and password required" });
    }
    const result = await login(email, password);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(401).json({ detail: err.message });
  }
});

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const profile = await getProfile(req.user!.user_id);
    return res.json({ success: true, data: profile });
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
});

export default router;
