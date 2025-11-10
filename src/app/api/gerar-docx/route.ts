// /app/api/gerar-docx/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const json = await req.json();

  const response = await fetch("https://aa7teoscnhgoiuvtadkpmdth.hooks.n8n.cloud/webhook-test/ltcat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Erro no n8n" }, { status: 500 });
  }

  const blob = await response.blob();
  return new NextResponse(blob, {
    headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  });
}
