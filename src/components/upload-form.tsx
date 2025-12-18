"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [anoEmissao, setAnoEmissao] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !anoEmissao) return;

    setLoading(true);
    setProgress(20);
    setAlert(null);
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("anoEmissao", anoEmissao);

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
        message: "O relatório foi gerado com sucesso!",
      });
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Falha ao processar o arquivo.",
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
          {/* Upload Excel */}
          <div className="space-y-1">
            <Label>Arquivo Excel (.xls ou .xlsx)</Label>
            <Input
              type="file"
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Ano / Emissão */}
          <div className="space-y-1">
            <Label>Ano / Emissão</Label>
            <Input
              type="text"
              placeholder="Ex: Dez/2025"
              value={anoEmissao}
              onChange={(e) => setAnoEmissao(e.target.value)}
            />
          </div>

          <Button
            disabled={!file || !anoEmissao || loading}
            type="submit"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Processando...
              </>
            ) : (
              "Gerar Relatório"
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
              download="relatorio.pdf"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              📄 Baixar relatorio
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
