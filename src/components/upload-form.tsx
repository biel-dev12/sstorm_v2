"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { FileDown, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  texto: z.string().min(2, "O texto é obrigatório."),
  arquivo: z.any().refine((files) => files?.length === 1, "Selecione um arquivo Excel."),
});

export function UploadForm() {
  const [downloadData, setDownloadData] = useState<{ url: string, filename: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { texto: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setDownloadData(null);
    setIsProcessing(true);

    const promise = async () => {
      const formData = new FormData();
      formData.append("texto", values.texto);
      formData.append("data", values.arquivo[0]);

      const response = await fetch("/api/upload-pdf", { method: "POST", body: formData });

      if (!response.ok) throw new Error("Erro");

      const encodedFilename = response.headers.get('filename') || "relatorio.pdf";
      const filename = decodeURIComponent(encodedFilename);

      // Captura o binário puro
      const buffer = await response.arrayBuffer();
      console.log("Buffer no Frontend (bytes):", buffer.byteLength);

      // Cria o Blob garantindo o tipo MIME
      const pdfBlob = new Blob([buffer], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(pdfBlob);
      setDownloadData({ url, filename });
      setIsProcessing(false);

      return `Arquivo pronto: ${filename}`;
    };

    toast.promise(promise(), {
      loading: 'Processando e gerando PDF...',
      success: (msg) => msg,
      error: 'Erro ao gerar PDF.',
    });
  }

  return (
    <div className="space-y-4 max-w-md w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border p-6 rounded-lg bg-card shadow-sm">
          <FormField
            control={form.control}
            name="texto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mês/Ano de emissão</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ago/2025" {...field} disabled={isProcessing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arquivo"
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <FormItem>
                <FormLabel>Arquivo Excel</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".xlsx, .xls"
                    disabled={isProcessing}
                    onChange={(e) => onChange(e.target.files)}
                    onBlur={onBlur}
                    name={name}
                    ref={ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Processando..." : "Enviar Dados"}
            {!isProcessing && <FileUp className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </Form>

      {downloadData && (
        <div className="p-4 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95">
          <div className="text-center">
            <p className="text-sm font-bold text-primary">Download Disponível</p>
            <p className="text-xs text-muted-foreground truncate max-w-[250px]">{downloadData.filename}</p>
          </div>
          <Button asChild variant="default" className="w-full">
            <a href={downloadData.url} download={downloadData.filename}>
              <FileDown className="mr-2 h-4 w-4" />
              Baixar Arquivo
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}