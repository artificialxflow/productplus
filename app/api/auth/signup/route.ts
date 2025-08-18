import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "../../generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "تمام فیلدها الزامی هستند" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل 6 کاراکتر باشد" },
        { status: 400 }
      )
    }

    // بررسی تکراری نبودن ایمیل
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    // رمزنگاری رمز عبور
    const hashedPassword = await bcrypt.hash(password, 12)

    // ایجاد کاربر جدید
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER" // نقش پیش‌فرض
      }
    })

    // حذف رمز عبور از پاسخ
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: "کاربر با موفقیت ایجاد شد",
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "خطا در ایجاد حساب کاربری" },
      { status: 500 }
    )
  }
}
