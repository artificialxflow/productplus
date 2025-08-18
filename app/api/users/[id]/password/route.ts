import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "../../../../generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه کاربر نامعتبر است" },
        { status: 400 }
      )
    }

    // بررسی دسترسی (کاربر می‌تواند رمز عبور خودش را تغییر دهد)
    const currentUserId = request.headers.get('x-user-id')
    const currentUserRole = request.headers.get('x-user-role')

    if (currentUserRole !== 'ADMIN' && currentUserId !== id.toString()) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "رمز عبور فعلی و جدید الزامی هستند" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور جدید باید حداقل 6 کاراکتر باشد" },
        { status: 400 }
      )
    }

    // بررسی وجود کاربر
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      )
    }

    // بررسی رمز عبور فعلی
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingUser.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "رمز عبور فعلی اشتباه است" },
        { status: 400 }
      )
    }

    // رمزنگاری رمز عبور جدید
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // بروزرسانی رمز عبور
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword
      }
    })

    return NextResponse.json({
      message: "رمز عبور با موفقیت تغییر یافت"
    })

  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: "خطا در تغییر رمز عبور" },
      { status: 500 }
    )
  }
}
