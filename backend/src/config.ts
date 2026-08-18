import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "8002"),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
  llmModel: process.env.LLM_MODEL || "deepseek-chat",
  llmBaseUrl: process.env.LLM_BASE_URL || "https://api.deepseek.com/v1",
  corsOrigins: process.env.CORS_ORIGINS || "http://localhost:3000",
  storageBucket: process.env.STORAGE_BUCKET || "documents",
};
