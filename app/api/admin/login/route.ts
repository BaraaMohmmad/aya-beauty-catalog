import { NextResponse } from "next/server"
import crypto from "crypto"
import { addToken } from "../check/route"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const password = body?.password?.toString?.() ?? ""

    // Compare with environment variable
    if (password && password === process.env.ADMIN_PASSWORD) {
      const res = NextResponse.json({ ok: true })

      // Generate a secure random token
      const token = crypto.randomBytes(32).toString("hex")

      // Save it to the valid tokens store
      addToken(token)

      // Set cookie (secure + HttpOnly)
      res.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      })

      return res
    }

    return NextResponse.json({ ok: false }, { status: 401 })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
}
