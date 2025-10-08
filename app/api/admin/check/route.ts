// app/api/admin/check/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { hasToken } from "../utils/tokens"

export async function GET() {
  const token = cookies().get("admin_session")?.value
  const ok = token ? hasToken(token) : false
  return NextResponse.json({ ok })
}
