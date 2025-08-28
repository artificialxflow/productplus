import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    console.log('Register request received')
    
    const body = await request.json()
    console.log('Request body:', { ...body, password: '[HIDDEN]' })
    
    const { name, email, password, phone } = body

    // اعتبارسنجی ورودی‌ها
    if (!name || !email || !password) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { error: "تمام فیلدها الزامی هستند" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short')
      return NextResponse.json(
        { error: "رمز عبور باید حداقل 6 کاراکتر باشد" },
        { status: 400 }
      )
    }

    // اعتبارسنجی ایمیل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Validation failed: invalid email format')
      return NextResponse.json(
        { error: "فرمت ایمیل نامعتبر است" },
        { status: 400 }
      )
    }

    console.log('Starting database operations')

    // بررسی تکراری نبودن ایمیل
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('User already exists with this email')
      return NextResponse.json(
        { error: "این ایمیل قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    // بررسی تکراری نبودن شماره تلفن (اگر ارسال شده)
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone }
      })

      if (existingPhone) {
        console.log('User already exists with this phone')
        return NextResponse.json(
          { error: "این شماره تلفن قبلاً ثبت شده است" },
          { status: 400 }
        )
      }
    }

    console.log('Hashing password')
    // رمزنگاری رمز عبور
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log('Creating user in database')
    // ایجاد کاربر جدید
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: "USER" // نقش پیش‌فرض
      }
    })

    console.log('User created successfully:', user.id)

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
    
    // بررسی نوع خطا برای Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string }
      
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: "این ایمیل یا شماره تلفن قبلاً ثبت شده است" },
          { status: 400 }
        )
      }
      
      if (prismaError.code === 'P1001') {
        return NextResponse.json(
          { error: "خطا در اتصال به دیتابیس" },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "خطا در ایجاد حساب کاربری" },
      { status: 500 }
    )
  }
}
