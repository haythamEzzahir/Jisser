import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabase, supabaseAnon } from "../database";
import type { AuthPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Missing or invalid token" });
  }
  try {
    const token = header.slice(7);
    const payload = jwt.decode(token) as any;
    if (!payload || !payload.sub) throw new Error("Invalid token");
    const userId = payload.sub;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    req.user = { user_id: userId, role: profile?.role || "student" };
    next();
  } catch {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ detail: "Forbidden" });
    }
    next();
  };
}

export async function login(email: string, password: string) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error("Invalid credentials");
  const token = data.session.access_token;
  const profile = await getProfile(data.user.id);
  return { access_token: token, user: profile };
}

export async function register(email: string, password: string, fullName: string, role: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (error) throw new Error(error.message);
}

export async function getProfile(userId: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}
