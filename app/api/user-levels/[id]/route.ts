import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

// دریافت سطح تخفیف خاص
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      )
    }

    const level = await prisma.userLevel.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!level) {
      return NextResponse.json(
        { error: "سطح تخفیف یافت نشد" },
        { status: 404 }
      )
    }

    return NextResponse.json(level)

  } catch (error) {
    console.error('Error fetching user level:', error)
    return NextResponse.json(
      { error: "خطا در دریافت سطح تخفیف" },
      { status: 500 }
    )
  }
}

// ویرایش سطح تخفیف
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      )
    }

    const { name, discountPercentage, description } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!name || discountPercentage === undefined) {
      return NextResponse.json(
        { error: "نام و درصد تخفیف الزامی هستند" },
        { status: 400 }
      )
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      return NextResponse.json(
        { error: "درصد تخفیف باید بین 0 تا 100 باشد" },
        { status: 400 }
      )
    }

    // بررسی وجود سطح تخفیف
    const existingLevel = await prisma.userLevel.findUnique({
      where: { id }
    })

    if (!existingLevel) {
      return NextResponse.json(
        { error: "سطح تخفیف یافت نشد" },
        { status: 404 }
      )
    }

    // بررسی تکراری نبودن نام (به جز خودش)
    const duplicateName = await prisma.userLevel.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })

    if (duplicateName) {
      return NextResponse.json(
        { error: "این نام سطح تخفیف قبلاً استفاده شده است" },
        { status: 400 }
      )
    }

    // بروزرسانی سطح تخفیف
    const updatedLevel = await prisma.userLevel.update({
      where: { id },
      data: {
        name,
        discountPercentage,
        description
      }
    })

    return NextResponse.json(
      { 
        message: "سطح تخفیف با موفقیت بروزرسانی شد",
        level: updatedLevel
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating user level:', error)
    return NextResponse.json(
      { error: "خطا در بروزرسانی سطح تخفیف" },
      { status: 500 }
    )
  }
}

// حذف سطح تخفیف
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه نامعتبر است" },
        { status: 400 }
      )
    }

    // بررسی وجود سطح تخفیف
    const existingLevel = await prisma.userLevel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true }
        }
      }
    })

    if (!existingLevel) {
      return NextResponse.json(
        { error: "سطح تخفیف یافت نشد" },
        { status: 404 }
      )
    }

    // بررسی اینکه آیا کاربرانی با این سطح تخفیف وجود دارند
    if (existingLevel._count.users > 0) {
      return NextResponse.json(
        { error: "نمی‌توان این سطح تخفیف را حذف کرد زیرا کاربرانی به آن تخصیص داده شده‌اند" },
        { status: 400 }
      )
    }

    // حذف سطح تخفیف
    await prisma.userLevel.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: "سطح تخفیف با موفقیت حذف شد" },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting user level:', error)
    return NextResponse.json(
      { error: "خطا در حذف سطح تخفیف" },
      { status: 500 }
    )
  }
}
