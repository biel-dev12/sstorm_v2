"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    nome: z.string().min(3, "Informe o nome"),
    cargo: z.string().min(2, "Informe o cargo"),
    destinatarios: z
        .string()
        .min(5, "Informe ao menos um destinatário"),
});

export function EnvioEmailForm() {
    const [isSending, setIsSending] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSending(true);

        const destinatarios = values.destinatarios
            .split("\n")
            .map((linha) => {
                const [email, empresa, link] = linha.split(";").map((s) => s.trim());
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
                nome: values.nome,
                cargo: values.cargo,
            },
            destinatarios,
        };

        const enviar = async () => {
            const res = await fetch("/api/envio-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Erro no envio");
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isSending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cargo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cargo</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isSending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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

                    <Button type="submit" className="w-full" disabled={isSending}>
                        {isSending ? "Enviando..." : "Enviar E-mails"}
                        {!isSending && <Send className="ml-2 h-4 w-4" />}
                    </Button>
                </form>
            </Form>

            {!isSending && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Assunto, corpo e CC são aplicados automaticamente
                </p>
            )}
        </div>
    );
}
