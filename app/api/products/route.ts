import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    // محاسبه offset برای pagination
    const offset = (page - 1) * limit

    // ساخت فیلترها
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // دریافت محصولات با pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          images: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // محاسبه اطلاعات pagination
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: "خطا در دریافت محصولات" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // ایجاد محصول جدید
    const product = await prisma.product.create({
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

    return NextResponse.json(
      { 
        message: "محصول با موفقیت ایجاد شد",
        product
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: "خطا در ایجاد محصول" },
      { status: 500 }
    )
  }
}
