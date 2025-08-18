import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "../../../../generated/prisma"

const prisma = new PrismaClient()

// دریافت اطلاعات کاربر
export async function GET(
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

    // بررسی دسترسی (کاربر می‌تواند اطلاعات خودش را ببیند یا مدیر)
    const currentUserId = request.headers.get('x-user-id')
    const currentUserRole = request.headers.get('x-user-role')

    if (currentUserRole !== 'ADMIN' && currentUserId !== id.toString()) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات کاربر" },
      { status: 500 }
    )
  }
}

// ویرایش کاربر
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

    // بررسی دسترسی (کاربر می‌تواند اطلاعات خودش را ویرایش کند یا مدیر)
    const currentUserId = request.headers.get('x-user-id')
    const currentUserRole = request.headers.get('x-user-role')

    if (currentUserRole !== 'ADMIN' && currentUserId !== id.toString()) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      )
    }

    const { name, email, role } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!name || !email) {
      return NextResponse.json(
        { error: "نام و ایمیل الزامی هستند" },
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

    // بررسی تکراری نبودن ایمیل (به جز خود کاربر)
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      if (emailExists) {
        return NextResponse.json(
          { error: "این ایمیل قبلاً استفاده شده است" },
          { status: 400 }
        )
      }
    }

    // بررسی نقش معتبر (فقط مدیران می‌توانند نقش را تغییر دهند)
    if (role && currentUserRole !== 'ADMIN') {
      return NextResponse.json(
        { error: "فقط مدیران می‌توانند نقش کاربران را تغییر دهند" },
        { status: 403 }
      )
    }

    if (role && !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: "نقش نامعتبر است" },
        { status: 400 }
      )
    }

    // ویرایش کاربر
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        ...(role && currentUserRole === 'ADMIN' && { role })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: "کاربر با موفقیت ویرایش شد",
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: "خطا در ویرایش کاربر" },
      { status: 500 }
    )
  }
}

// حذف کاربر (فقط برای مدیران)
export async function DELETE(
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

    // بررسی نقش کاربر (فقط مدیران)
    const currentUserRole = request.headers.get('x-user-role')
    if (currentUserRole !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
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

    // بررسی اینکه کاربر خود مدیر نباشد
    if (existingUser.role === 'ADMIN') {
      return NextResponse.json(
        { error: "نمی‌توانید مدیران را حذف کنید" },
        { status: 400 }
      )
    }

    // حذف کاربر
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "کاربر با موفقیت حذف شد"
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: "خطا در حذف کاربر" },
      { status: 500 }
    )
  }
}
