import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"

export async function POST() {
  const cookieStore = await cookies()

  cookieStore.set({
    name: "session",
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  })

  return NextResponse.json({ success: true })
}
