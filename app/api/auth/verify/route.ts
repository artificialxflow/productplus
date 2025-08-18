import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // دریافت token از cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "توکن احراز هویت یافت نشد" },
        { status: 401 }
      )
    }

    // تایید token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "your-secret-key"
    ) as any

    return NextResponse.json(
      { 
        message: "توکن معتبر است",
        user: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json(
      { error: "توکن نامعتبر است" },
      { status: 401 }
    )
  }
}
