import { NextResponse } from "next/server"

// Temporary in-memory token store
const validTokens = new Set<string>()

// Allow other routes to access these
export function addToken(token: string) {
  validTokens.add(token)
}

export function removeToken(token: string) {
  validTokens.delete(token)
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || ""
  const token = cookieHeader.match(/admin_session=([^;]+)/)?.[1]

  if (token && validTokens.has(token)) {
    return NextResponse.json({ ok: true })
  } else {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}
