import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const password_hash = await bcrypt.hash(body.password, 10)

    const res = await fetch(process.env.N8N_AUTH_REGISTER_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
      },
      body: JSON.stringify({
        email: body.email,
        cargo: body.cargo,
        first_name: body.first_name,
        last_name: body.last_name,
        password_hash,
      }),
    })

    if (res.status === 409) {
      return NextResponse.json(
        { error: "Usuário já existe" },
        { status: 409 }
      )
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro no cadastro" },
        { status: res.status }
      )
    }

    return NextResponse.json({ status: "ok" })
  } catch (err) {
    console.error("REGISTER ERROR:", err)
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}
