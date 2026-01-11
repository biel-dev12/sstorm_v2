"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Send, CheckCircle2, MailOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers/auth-provider";

/* =========================
   Schema (somente o necessário)
========================= */
const formSchema = z.object({
  destinatarios: z
    .string()
    .min(5, "Informe ao menos um destinatário"),
});

type FormValues = z.infer<typeof formSchema>;

export function EnvioEmailForm() {
  const { user, loading } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  // Aqui ficarão os dados puxados do outro fluxo
  const [emailsLidos, setEmailsLidos] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destinatarios: "",
    },
  });

  if (loading) return <p>Carregando...</p>;
  if (!user) return <p>Não autenticado</p>;

  /* =========================
     Ler e-mails (outro fluxo)
  ========================= */
  async function handleLerEmails() {
    try {
      setIsLoadingEmails(true);

      const res = await fetch("/api/ler-emails", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Erro ao ler e-mails");
      }

      const data = await res.json();

      // Guarda os dados para uso futuro
      setEmailsLidos(data);

      toast.success("E-mails carregados com sucesso");

      // 👉 Se quiser futuramente preencher o textarea:
      // form.setValue("destinatarios", transformarData(data));

    } catch (err) {
      toast.error("Falha ao buscar e-mails");
    } finally {
      setIsLoadingEmails(false);
    }
  }

  /* =========================
     Envio de e-mails
  ========================= */
  async function onSubmit(values: FormValues) {
    setIsSending(true);

    const destinatarios = values.destinatarios
      .split("\n")
      .map((linha) => {
        const [email, empresa, link] = linha
          .split(";")
          .map((s) => s.trim());
        return { email, empresa, link };
      })
      .filter((d) => d.email && d.empresa && d.link);

    if (destinatarios.length === 0) {
      toast.error("Nenhum destinatário válido encontrado.");
      setIsSending(false);
      return;
    }

    const payload = {
      remetente: {
        nome: user.first_name,
        sobrenome: user.last_name,
        cargo: user.cargo,
        email: user.email,
      },
      destinatarios,
    };

    const enviar = async () => {
      const res = await fetch("/api/envio-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Erro no envio");
      }

      return "E-mails enviados com sucesso!";
    };

    toast.promise(enviar(), {
      loading: "Enviando e-mails...",
      success: (msg) => msg,
      error: "Erro ao enviar e-mails",
    });

    setIsSending(false);
  }

  return (
    <div className="max-w-2xl w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 border p-6 rounded-lg bg-card shadow-sm"
        >
          {/* Botão Ler Emails */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleLerEmails}
            disabled={isLoadingEmails}
            className="w-full"
          >
            {isLoadingEmails ? "Lendo e-mails..." : "Ler e-mails"}
            {!isLoadingEmails && <MailOpen className="ml-2 h-4 w-4" />}
          </Button>

          {/* Destinatários */}
          <FormField
            control={form.control}
            name="destinatarios"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Destinatários (email;empresa;link — um por linha)
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={6}
                    placeholder="cliente@empresa.com;Empresa XYZ;https://link.com/abc"
                    {...field}
                    disabled={isSending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSending}
          >
            {isSending ? "Enviando..." : "Enviar E-mails"}
            {!isSending && <Send className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </Form>

      {!isSending && (
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          Importante: Assunto, corpo e CC são aplicados automaticamente
        </p>
      )}
    </div>
  );
}
