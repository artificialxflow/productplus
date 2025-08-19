import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // دریافت token از cookie یا Authorization header
    let token = request.cookies.get("auth-token")?.value
    
    if (!token) {
      // بررسی Authorization header
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }

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

    // دریافت اطلاعات کامل کاربر از دیتابیس
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        level: {
          select: {
            id: true,
            name: true,
            discountPercentage: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      )
    }

    // حذف اطلاعات حساس
    const { password: _, otpCode: __, otpExpires: ___, ...userWithoutSensitive } = user

    return NextResponse.json(
      { 
        message: "توکن معتبر است",
        user: {
          ...userWithoutSensitive,
          discountPercentage: user.level?.discountPercentage || user.discountPercentage || 0
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
