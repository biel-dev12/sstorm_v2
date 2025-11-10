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
    // 🔹 Envia o PDF para o n8n (que faz o processamento e gera o DOCX)
    const res = await fetch("https://forced-leftwardly-mary.ngrok-free.dev/webhook-test/ltcat", {
      method: "POST",
      body: n8nData,
    });

    // 🔹 Verifica se o n8n respondeu corretamente
    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Erro do n8n:", errText);
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    // 🔹 Tenta identificar o tipo da resposta
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Caso o n8n mande um JSON com o arquivo em base64
      const result = await res.json();
      const fileData = result.dados?.data;
      const fileName =
        result.dados?.fileName || "LTCAT.docx";
      const mimeType =
        result.dados?.mimeType ||
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (!fileData) throw new Error("Campo 'dados.data' ausente no JSON.");

      const buffer = Buffer.from(fileData, "base64");

      return new Response(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    } else {
      // 🔹 Caso o n8n já retorne o DOCX binário diretamente
      const buffer = await res.arrayBuffer();
      return new Response(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": "attachment; filename=LTCAT.docx",
        },
      });
    }
  } catch (err: any) {
    console.error("🚨 Erro no upload route:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
