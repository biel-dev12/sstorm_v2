"use client";

import { useEffect, useState } from "react";
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
import { useAuth } from "@/components/providers/auth-provider";

/* ------------------------------------------------------------------ */
/* Schema */
/* ------------------------------------------------------------------ */
const formSchema = z.object({
    remetente_nome: z.string(),
    remetente_cargo: z.string(),
    destinatarios: z
        .string()
        .min(5, "Informe ao menos um destinatário"),
});

type FormValues = z.infer<typeof formSchema>;

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */
export function EnvioEmailForm() {
    const { user, loading } = useAuth();
    const [isSending, setIsSending] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            remetente_nome: "",
            remetente_cargo: "",
            destinatarios: "",
        },
    });

    /* ---------------------------------------------------------------- */
    /* Preenche dados do usuário (sem permitir edição) */
    /* ---------------------------------------------------------------- */
    useEffect(() => {
        if (!user) return;

        form.setValue("remetente_nome", user.first_name, {
            shouldDirty: false,
            shouldTouch: false,
        });

        form.setValue("remetente_cargo", user.cargo, {
            shouldDirty: false,
            shouldTouch: false,
        });
    }, [user, form]);

    /* ---------------------------------------------------------------- */
    /* Estados globais */
    /* ---------------------------------------------------------------- */
    if (loading) {
        return <p>Carregando...</p>;
    }

    if (!user) {
        return <p>Não autenticado</p>;
    }

    /* ---------------------------------------------------------------- */
    /* Submit */
    /* ---------------------------------------------------------------- */
    async function onSubmit(values: FormValues) {
        if (!user) {
            toast.error("Usuário não autenticado");
            return;
        }

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
                cargo: user.cargo,
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

    /* ---------------------------------------------------------------- */
    /* Render */
    /* ---------------------------------------------------------------- */
    return (
        <div className="max-w-2xl w-full">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    autoComplete="off"
                    className="space-y-6 border p-6 rounded-lg bg-card shadow-sm"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nome */}
                        <FormField
                            control={form.control}
                            name="remetente_nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            readOnly
                                            autoComplete="new-password"
                                            className="bg-muted cursor-not-allowed"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Cargo */}
                        <FormField
                            control={form.control}
                            name="remetente_cargo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cargo</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            readOnly
                                            autoComplete="new-password"
                                            className="bg-muted cursor-not-allowed"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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
                    Assunto, corpo e CC são aplicados automaticamente
                </p>
            )}
        </div>
    );
}
