import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma";

// دریافت لیست سفارشات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // محاسبه offset برای pagination
    const offset = (page - 1) * limit

    // ساخت فیلترها
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (userId) {
      where.userId = parseInt(userId)
    }

    // دریافت سفارشات با pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: {
                    select: {
                      id: true,
                      url: true,
                      alt: true,
                      isPrimary: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    // محاسبه اطلاعات pagination
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      orders,
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
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: "خطا در دریافت سفارشات" },
      { status: 500 }
    )
  }
}

// ایجاد سفارش جدید
export async function POST(request: NextRequest) {
  try {
    const { userId, items, totalAmount } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "اطلاعات سفارش ناقص است" },
        { status: 400 }
      )
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: "مبلغ کل نامعتبر است" },
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
        { status: 400 }
      )
    }

    // بررسی موجودی محصولات
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json(
          { error: `محصول با شناسه ${item.productId} یافت نشد` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `موجودی محصول ${product.name} کافی نیست` },
          { status: 400 }
        )
      }
    }

    // ایجاد سفارش و آیتم‌ها در یک تراکنش
    const order = await prisma.$transaction(async (tx: any) => {
      // ایجاد سفارش
      const newOrder = await tx.order.create({
        data: {
          userId: parseInt(userId),
          status: 'PENDING',
          totalAmount: parseFloat(totalAmount)
        }
      })

      // ایجاد آیتم‌های سفارش و کاهش موجودی
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        })

        // کاهش موجودی محصول
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      return newOrder
    })

    // دریافت سفارش کامل با جزئیات
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: {
                  select: {
                    id: true,
                    url: true,
                    alt: true,
                    isPrimary: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: "سفارش با موفقیت ایجاد شد",
        order: completeOrder
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: "خطا در ایجاد سفارش" },
      { status: 500 }
    )
  }
}
