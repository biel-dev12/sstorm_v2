import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie")
  const session = cookie?.match(/session=([^;]+)/)?.[1]

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const res = await fetch(process.env.N8N_AUTH_ME!, {
    method: "GET",
    headers: {
      "X-Session-Token": session,
      "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!,
    },
  })

  if (!res.ok) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }

  return NextResponse.json(await res.json())
}
