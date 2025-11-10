"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setProgress(20);
    setAlert(null);
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao processar o arquivo");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

      setAlert({
        type: "success",
        message: "O documento LTCAT foi gerado com sucesso!",
      });
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Falha ao processar o PDF.",
      });
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-4 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button disabled={!file || loading} type="submit" className="w-full">
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Processando...
              </>
            ) : (
              "Enviar PDF"
            )}
          </Button>
          {loading && <Progress value={progress} className="w-full" />}
        </form>

        {alert && (
          <Alert
            className={`border ${
              alert.type === "success"
                ? "border-green-500/40 bg-green-50 text-green-700"
                : "border-red-500/40 bg-red-50 text-red-700"
            }`}
          >
            {alert.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {alert.type === "success" ? "Sucesso" : "Erro"}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {downloadUrl && (
          <div className="text-center mt-4">
            <a
              href={downloadUrl}
              download="LTCAT.docx"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              📄 Baixar LTCAT.docx
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
