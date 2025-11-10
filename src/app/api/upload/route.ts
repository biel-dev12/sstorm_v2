import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const n8nData = new FormData();
  n8nData.append("file", file);

  try {
    const res = await fetch("http://192.168.1.78:5678/webhook-test/ltcat", {
      method: "POST",
      body: n8nData,
    });

    // Espera o JSON do n8n
    const result = await res.json();

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
