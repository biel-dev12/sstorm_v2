import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie")
    const session = cookie?.match(/session=([^;]+)/)?.[1]

    if (session) {
      // avisa o n8n para invalidar a sessão
      await fetch(process.env.N8N_AUTH_LOGOUT_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
        },
        body: JSON.stringify({ token: session }),
      })
    }

    // apaga o cookie
    const res = NextResponse.json({ status: "ok" })
    res.headers.set(
      "Set-Cookie",
      "session=; Path=/; Max-Age=0; SameSite=Lax"
    )

    return res
  } catch (err) {
    console.error("LOGOUT ERROR:", err)
    return NextResponse.json(
      { error: "Erro ao sair" },
      { status: 500 }
    )
  }
}