import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "../../../../generated/prisma"

const prisma = new PrismaClient()

// دریافت محصول خاص
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "محصول یافت نشد" },
        { status: 404 }
      )
    }

    return NextResponse.json(product)

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: "خطا در دریافت محصول" },
      { status: 500 }
    )
  }
}

// ویرایش محصول
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است" },
        { status: 400 }
      )
    }

    const { name, price, description, image, stock, categoryId } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!name || !price || stock === undefined) {
      return NextResponse.json(
        { error: "نام، قیمت و موجودی الزامی هستند" },
        { status: 400 }
      )
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "قیمت باید بیشتر از صفر باشد" },
        { status: 400 }
      )
    }

    if (stock < 0) {
      return NextResponse.json(
        { error: "موجودی نمی‌تواند منفی باشد" },
        { status: 400 }
      )
    }

    // بررسی وجود محصول
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "محصول یافت نشد" },
        { status: 404 }
      )
    }

    // بررسی وجود دسته‌بندی
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      })
      if (!category) {
        return NextResponse.json(
          { error: "دسته‌بندی یافت نشد" },
          { status: 400 }
        )
      }
    }

    // ویرایش محصول
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        description,
        image,
        stock: parseInt(stock),
        categoryId: categoryId ? parseInt(categoryId) : null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "محصول با موفقیت ویرایش شد",
      product: updatedProduct
    })

  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: "خطا در ویرایش محصول" },
      { status: 500 }
    )
  }
}

// حذف محصول
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است" },
        { status: 400 }
      )
    }

    // بررسی وجود محصول
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "محصول یافت نشد" },
        { status: 404 }
      )
    }

    // حذف محصول
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "محصول با موفقیت حذف شد"
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: "خطا در حذف محصول" },
      { status: 500 }
    )
  }
}
