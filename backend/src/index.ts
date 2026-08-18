import express from "express";
import cors from "cors";
import { config } from "./config";
import authRoutes from "./routes/auth";
import studentRoutes from "./routes/students";
import companyRoutes from "./routes/companies";
import adminRoutes from "./routes/admin";
import contractRoutes from "./routes/contracts";
import paymentRoutes from "./routes/payments";
import documentRoutes from "./routes/documents";
import pdfRoutes from "./routes/pdf";

const app = express();

app.use(cors({ origin: config.corsOrigins.split(","), credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api", pdfRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(config.port, () => {
  console.log(`Jisser API running on http://localhost:${config.port}`);
});
