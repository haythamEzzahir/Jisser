import { Router, Request, Response } from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth";
import { supabase } from "../database";
import { config } from "../config";
import { processDocumentUpload } from "../services/documents";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { doc_type, related_to } = req.body;
      if (!file || !doc_type) {
        return res.status(400).json({ detail: "file and doc_type are required" });
      }
      const fileName = `${req.user!.user_id}/${doc_type}_${file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from(config.storageBucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype || "application/octet-stream",
          upsert: true,
        });
      if (uploadError) return res.status(400).json({ detail: uploadError.message });
      const { data: urlData } = supabase.storage
        .from(config.storageBucket)
        .getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      const { data: docResult, error: dbError } = await supabase
        .from("documents")
        .insert({
          uploaded_by: req.user!.user_id,
          related_to: related_to || null,
          doc_type,
          file_name: file.originalname,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.mimetype,
        })
        .select();
      if (dbError) return res.status(400).json({ detail: dbError.message });
      const docId = docResult ? docResult[0].id : null;
      const isImage = file.mimetype && file.mimetype.startsWith("image/");
      if (isImage && docId) {
        const b64 = file.buffer.toString("base64");
        try {
          await processDocumentUpload(docId, b64, doc_type, true);
        } catch {
          // ignore image processing errors
        }
      }
      return res.json({ success: true, data: { id: docId, url: publicUrl } });
    } catch (err: any) {
      return res.status(500).json({ detail: err.message });
    }
  }
);

export default router;
