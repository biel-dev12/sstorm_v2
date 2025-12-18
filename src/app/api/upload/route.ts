import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "upload route OK" });
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const file = formData.get("file") as File;
  const anoEmissao = formData.get("anoEmissao") as string;

  if (!file) {
    return NextResponse.json(
      { error: "Nenhum arquivo enviado." },
      { status: 400 }
    );
  }

  if (!anoEmissao) {
    return NextResponse.json(
      { error: "Ano/Emissão não informado." },
      { status: 400 }
    );
  }

  // 🔹 Prepara dados para o n8n
  const n8nData = new FormData();
  n8nData.append("file", file);
  n8nData.append("anoEmissao", anoEmissao);

  try {
    const res = await fetch(
      "https://aut-doctors-n8n.cgalnz.easypanel.host/webhook-test/recebe-arquivo",
      {
        method: "POST",
        body: n8nData,
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Erro do n8n:", errText);
      return NextResponse.json(
        { error: errText },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("content-type") || "";

    // 🔹 Normaliza nome do arquivo
    const safeAno = anoEmissao.replace("/", "-");
    const fileName = `LTCAT_${safeAno}.pdf`;

    // 🔹 Caso o n8n retorne JSON com base64
    if (contentType.includes("application/json")) {
      const result = await res.json();

      const fileData = result.dados?.data;
      const mimeType = result.dados?.mimeType || "application/pdf";

      if (!fileData) {
        throw new Error("Campo 'dados.data' ausente no JSON.");
      }

      const buffer = Buffer.from(fileData, "base64");

      return new Response(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    // 🔹 Caso o n8n já retorne o PDF binário
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });

  } catch (err: any) {
    console.error("🚨 Erro no upload route:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
