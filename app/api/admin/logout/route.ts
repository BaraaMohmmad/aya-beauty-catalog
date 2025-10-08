import { NextResponse } from "next/server"
import { removeToken } from "../check/route"

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") || ""
  const token = cookieHeader.match(/admin_session=([^;]+)/)?.[1]

  if (token) removeToken(token)

  const res = NextResponse.json({ ok: true })

  // Delete the cookie
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 0,
  })

  return res
}
