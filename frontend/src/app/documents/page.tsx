"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Document, DocType } from "@/types";

const requiredDocs: { key: DocType; label: string }[] = [
  { key: "cin", label: "Carte d'identité (CIN)" },
  { key: "transcript", label: "Relevé de notes" },
  { key: "enrollment_certificate", label: "Certificat d'inscription" },
  { key: "cv", label: "CV" },
  { key: "motivation_letter", label: "Lettre de motivation" },
  { key: "photo", label: "Photo d'identité" },
];

export default function DocumentsPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !profile) router.push("/login");
  }, [profile, loading, router]);

  useEffect(() => {
    if (!profile) return;
    api.get("/api/students/documents").then((r: any) => setDocs(r.data || [])).catch(() => {});
    api.get("/api/students/credit-request").then((r: any) => {
      if (r.data) setApplicationId(r.data.id);
    }).catch(() => {});
  }, [profile]);

  const getStatus = (key: DocType) => {
    const doc = docs.find((d) => d.doc_type === key);
    if (!doc) return { label: "Manquant", color: "outline" as const };
    if (doc.verified) return { label: "Validé", color: "default" as const };
    return { label: "Uploadé", color: "secondary" as const };
  };

  const handleUpload = async (key: DocType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(key);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("doc_type", key);
        if (applicationId) fd.append("related_to", applicationId);
        await api.upload("/api/documents/upload", fd);
        const r = await api.get<any>("/api/students/documents");
        setDocs(r.data || []);
      } catch { alert("Erreur"); }
      finally { setUploading(null); }
    };
    input.click();
  };

  if (loading || !profile) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Documents</h1>
      <Card>
        <CardHeader><CardTitle>Documents requis</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requiredDocs.map(({ key, label }) => {
              const { label: sLabel, color } = getStatus(key);
              return (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <p className="font-medium">{label}</p>
                  <div className="flex items-center gap-3">
                    <Badge variant={color}>{sLabel}</Badge>
                    <Button size="sm" variant="outline" onClick={() => handleUpload(key)} disabled={uploading === key}>
                      {uploading === key ? "..." : "Uploader"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
