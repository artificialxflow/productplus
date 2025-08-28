import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const { userId, newRole } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "شناسه کاربر و نقش جدید الزامی است" },
        { status: 400 }
      )
    }

    if (!['USER', 'ADMIN'].includes(newRole)) {
      return NextResponse.json(
        { error: "نقش نامعتبر است. نقش باید USER یا ADMIN باشد" },
        { status: 400 }
      )
    }

    // بررسی وجود کاربر
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      )
    }

    // تغییر نقش کاربر
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isPhoneVerified: true,
        levelId: true,
        discountPercentage: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: `نقش کاربر ${updatedUser.name} به ${newRole} تغییر یافت`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Error changing user role:', error)
    return NextResponse.json(
      { error: "خطا در تغییر نقش کاربر" },
      { status: 500 }
    )
  }
}
