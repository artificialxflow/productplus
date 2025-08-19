import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient()

// دریافت تمام سطوح تخفیف
export async function GET() {
  try {
    const levels = await prisma.userLevel.findMany({
      orderBy: { discountPercentage: 'asc' },
      include: {
        _count: {
          select: { users: true }
        }
      }
    })

    return NextResponse.json(levels)

  } catch (error) {
    console.error('Error fetching user levels:', error)
    return NextResponse.json(
      { error: "خطا در دریافت سطوح تخفیف" },
      { status: 500 }
    )
  }
}

// ایجاد سطح تخفیف جدید
export async function POST(request: NextRequest) {
  try {
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

    // بررسی تکراری نبودن نام
    const existingLevel = await prisma.userLevel.findUnique({
      where: { name }
    })

    if (existingLevel) {
      return NextResponse.json(
        { error: "این نام سطح تخفیف قبلاً استفاده شده است" },
        { status: 400 }
      )
    }

    // ایجاد سطح تخفیف جدید
    const level = await prisma.userLevel.create({
      data: {
        name,
        discountPercentage,
        description
      }
    })

    return NextResponse.json(
      { 
        message: "سطح تخفیف با موفقیت ایجاد شد",
        level
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating user level:', error)
    return NextResponse.json(
      { error: "خطا در ایجاد سطح تخفیف" },
      { status: 500 }
    )
  }
}
