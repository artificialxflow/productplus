import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "../../../generated/prisma";
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { phone, otpCode } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!phone || !otpCode) {
      return NextResponse.json(
        { error: "شماره موبایل و کد تایید الزامی هستند" },
        { status: 400 }
      )
    }

    // بررسی فرمت شماره موبایل
    const phoneRegex = /^(\+98|0)?9\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "فرمت شماره موبایل صحیح نیست" },
        { status: 400 }
      )
    }

    // بررسی فرمت کد OTP
    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: "کد تایید باید 6 رقم باشد" },
        { status: 400 }
      )
    }

    // پیدا کردن کاربر
    const user = await prisma.user.findUnique({
      where: { phone }
    })

    if (!user) {
      return NextResponse.json(
        { error: "کاربری با این شماره موبایل یافت نشد" },
        { status: 404 }
      )
    }

    // بررسی کد OTP
    if (user.otpCode !== otpCode) {
      return NextResponse.json(
        { error: "کد تایید اشتباه است" },
        { status: 400 }
      )
    }

    // بررسی انقضای کد OTP
    if (user.otpExpires && new Date() > user.otpExpires) {
      return NextResponse.json(
        { error: "کد تایید منقضی شده است" },
        { status: 400 }
      )
    }

    // تایید شماره موبایل و پاک کردن OTP
    await prisma.user.update({
      where: { phone },
      data: {
        isPhoneVerified: true,
        otpCode: null,
        otpExpires: null
      }
    })

    // تولید JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone,
        role: user.role 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    )

    // حذف رمز عبور از پاسخ
    const { password: _, otpCode: __, otpExpires: ___, ...userWithoutSensitive } = user

    // تنظیم cookie
    const response = NextResponse.json(
      { 
        message: "احراز هویت با موفقیت انجام شد",
        user: userWithoutSensitive,
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
    console.error("Verify OTP error:", error)
    return NextResponse.json(
      { error: "خطا در تایید کد" },
      { status: 500 }
    )
  }
}
