import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma";

// دریافت تمام دسته‌بندی‌ها
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    // تبدیل به فرمت مورد نیاز
    const categoriesWithCount = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      productCount: category._count.products
    }))

    return NextResponse.json(categoriesWithCount)

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی‌ها" },
      { status: 500 }
    )
  }
}

// ایجاد دسته‌بندی جدید
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!name) {
      return NextResponse.json(
        { error: "نام دسته‌بندی الزامی است" },
        { status: 400 }
      )
    }

    // بررسی تکراری نبودن نام
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "این نام دسته‌بندی قبلاً استفاده شده است" },
        { status: 400 }
      )
    }

    // ایجاد دسته‌بندی جدید
    const category = await prisma.category.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json(
      { 
        message: "دسته‌بندی با موفقیت ایجاد شد",
        category
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: "خطا در ایجاد دسته‌بندی" },
      { status: 500 }
    )
  }
}
