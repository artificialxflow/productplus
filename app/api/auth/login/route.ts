import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!email || !password) {
      return NextResponse.json(
        { error: "ایمیل و رمز عبور الزامی هستند" },
        { status: 400 }
      )
    }

    // پیدا کردن کاربر
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "ایمیل یا رمز عبور اشتباه است" },
        { status: 401 }
      )
    }

    // بررسی رمز عبور
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "ایمیل یا رمز عبور اشتباه است" },
        { status: 401 }
      )
    }

    // تولید JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    )

    // حذف رمز عبور از پاسخ
    const { password: _, ...userWithoutPassword } = user

    // تنظیم cookie
    const response = NextResponse.json(
      { 
        message: "ورود موفقیت‌آمیز",
        user: userWithoutPassword,
        token
      },
      { status: 200 }
    )

    // تنظیم HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 // 7 روز
    })

    return response

  } catch (error) {
    console.error("Login error:", error)
    
    // Type guard برای error
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    } else {
      console.error("Unknown error:", error)
    }
    
    return NextResponse.json(
      { error: "خطا در ورود به سیستم" },
      { status: 500 }
    )
  }
}
