import { NextRequest, NextResponse } from "next/server"

export function proxy(req: NextRequest) {
  const token = req.cookies.get("session")?.value
  const { pathname } = req.nextUrl

  const publicRoutes = ["/login", "/register"]

  // ignora APIs completamente
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // usuário logado não acessa login/register
  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // usuário não logado tentando acessar rota privada
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
}
