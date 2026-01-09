import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const res = await fetch(process.env.N8N_AUTH_LOGIN_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Erro ao autenticar" },
        { status: res.status }
      )
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set({
      name: "session",
      value: data.token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    })

    return response
  } catch (err) {
    console.error("LOGIN ERROR:", err)
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}
