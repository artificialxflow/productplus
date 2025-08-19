import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // اعتبارسنجی شماره موبایل
    if (!phone) {
      return NextResponse.json(
        { error: "شماره موبایل الزامی است" },
        { status: 400 }
      )
    }

    // بررسی فرمت شماره موبایل (فارسی)
    const phoneRegex = /^(\+98|0)?9\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "فرمت شماره موبایل صحیح نیست" },
        { status: 400 }
      )
    }

    // تولید کد OTP تصادفی 6 رقمی
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // تنظیم زمان انقضا (5 دقیقه)
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000)

    // بررسی وجود کاربر با این شماره موبایل
    let user = await prisma.user.findUnique({
      where: { phone }
    })

    if (user) {
      // بروزرسانی OTP برای کاربر موجود
      await prisma.user.update({
        where: { phone },
        data: {
          otpCode,
          otpExpires
        }
      })
    } else {
      // ایجاد کاربر جدید با شماره موبایل
      user = await prisma.user.create({
        data: {
          phone,
          name: `کاربر ${phone.slice(-4)}`, // نام موقت
          email: `${phone}@temp.com`, // ایمیل موقت
          password: "temp_password", // رمز عبور موقت
          otpCode,
          otpExpires,
          isPhoneVerified: false
        }
      })
    }

    // در محیط production، اینجا کد OTP را از طریق SMS ارسال می‌کنیم
    // فعلاً برای تست، کد را در response برمی‌گردانیم
    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP Code for ${phone}: ${otpCode}`)
    }

    return NextResponse.json(
      { 
        message: "کد تایید ارسال شد",
        phone,
        // در production این فیلد حذف می‌شود
        otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "خطا در ارسال کد تایید" },
      { status: 500 }
    )
  }
}
