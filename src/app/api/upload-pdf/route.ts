import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const N8N_URL = "https://n8n.doctorspraiagrande.com.br/webhook/recebe-arquivo";

        const n8nResponse = await fetch(N8N_URL, {
            method: 'POST',
            body: formData,
        });

        if (!n8nResponse.ok) {
            return NextResponse.json({ error: "Erro no n8n" }, { status: n8nResponse.status });
        }

        // Pega o nome do header 'filename' que você configurou
        const rawFilename = n8nResponse.headers.get('filename') || 'documento.pdf';

        // IMPORTANTE: Receber como arrayBuffer para não corromper o binário
        const pdfBuffer = await n8nResponse.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                // Usamos o rawFilename direto pois ele já está no formato URI seguro
                'Content-Disposition': `attachment; filename*=UTF-8''${rawFilename}`,
                'Access-Control-Expose-Headers': 'Content-Disposition, filename',
                'filename': rawFilename,
            },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}