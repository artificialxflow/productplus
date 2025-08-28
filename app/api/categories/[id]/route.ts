import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma";

// دریافت دسته‌بندی خاص
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه دسته‌بندی نامعتبر است" },
        { status: 400 }
      )
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: category.id,
      name: category.name,
      description: category.description,
      productCount: category._count.products
    })

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی" },
      { status: 500 }
    )
  }
}

// ویرایش دسته‌بندی
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه دسته‌بندی نامعتبر است" },
        { status: 400 }
      )
    }

    const { name, description } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!name) {
      return NextResponse.json(
        { error: "نام دسته‌بندی الزامی است" },
        { status: 400 }
      )
    }

    // بررسی تکراری نبودن نام (به جز خود دسته‌بندی)
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "این نام دسته‌بندی قبلاً استفاده شده است" },
        { status: 400 }
      )
    }

    // بروزرسانی دسته‌بندی
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description
      }
    })

    return NextResponse.json({
      message: "دسته‌بندی با موفقیت بروزرسانی شد",
      category: updatedCategory
    })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: "خطا در بروزرسانی دسته‌بندی" },
      { status: 500 }
    )
  }
}

// حذف دسته‌بندی
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه دسته‌بندی نامعتبر است" },
        { status: 400 }
      )
    }

    // بررسی وجود محصولات در این دسته
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!categoryWithProducts) {
      return NextResponse.json(
        { error: "دسته‌بندی یافت نشد" },
        { status: 404 }
      )
    }

    if (categoryWithProducts._count.products > 0) {
      return NextResponse.json(
        { error: "نمی‌توان دسته‌بندی حاوی محصول را حذف کرد" },
        { status: 400 }
      )
    }

    // حذف دسته‌بندی
    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "دسته‌بندی با موفقیت حذف شد"
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: "خطا در حذف دسته‌بندی" },
      { status: 500 }
    )
  }
}
