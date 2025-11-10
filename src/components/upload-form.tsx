"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState<"upload" | "extracted">("upload");
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setResult(null);
    setAlert(null);
    setStep("upload");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(20);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(70);

      if (!res.ok) throw new Error("Falha ao processar o PDF");

      const data = await res.json();

      if (!data || !data.nome_empresa) {
        throw new Error("Resposta inválida do servidor");
      }

      setResult(data);
      setProgress(100);
      setStep("extracted");

      setAlert({
        type: "success",
        message: "Os dados foram extraídos com sucesso!",
      });
    } catch (err: any) {
      console.error(err);
      setAlert({
        type: "error",
        message: err.message || "Falha ao processar o PDF.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocx = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gerar-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      if (!res.ok) throw new Error("Erro ao gerar documento");

      // const blob = await res.blob();
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement("a");
      // link.href = url;
      // link.download = "LTCAT.docx";
      // link.click();

      setAlert({
        type: "success",
        message: "O arquivo LTCAT.docx foi baixado com sucesso!",
      });
    } catch (err: any) {
      console.error(err);
      setAlert({
        type: "error",
        message: err.message || "Falha ao gerar o documento.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-4 p-6">
        {step === "upload" && (
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
        )}

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

        {step === "extracted" && result && (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold">
              Empresa: {result.nome_empresa}
            </p>
            <Button onClick={handleGenerateDocx} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Gerando Documento...
                </>
              ) : (
                "Gerar DOCX"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
