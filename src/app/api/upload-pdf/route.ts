import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const n8nResponse = await fetch(
            process.env.N8N_RECEBE_ARQUIVO_URL!,
            {
                method: "POST",
                headers: {
                    "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
                },
                body: formData,
            }
        );

        if (!n8nResponse.ok) {
            return NextResponse.json({ error: "Erro no n8n" }, { status: n8nResponse.status });
        }

        // Pega o nome do header 'filename' configurado
        const rawFilename = n8nResponse.headers.get('filename') || 'documento.pdf';

        const pdfBuffer = await n8nResponse.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename*=UTF-8''${rawFilename}`,
                'Access-Control-Expose-Headers': 'Content-Disposition, filename',
                'filename': rawFilename,
            },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}