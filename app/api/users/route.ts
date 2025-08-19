import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient()

// دریافت لیست کاربران (فقط برای مدیران)
export async function GET(request: NextRequest) {
  try {
    // بررسی نقش کاربر (فقط مدیران)
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')

    // محاسبه offset برای pagination
    const offset = (page - 1) * limit

    // ساخت فیلترها
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role) {
      where.role = role
    }

    // دریافت کاربران با pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // محاسبه اطلاعات pagination
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      users,
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
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: "خطا در دریافت کاربران" },
      { status: 500 }
    )
  }
}

// ایجاد کاربر جدید (فقط برای مدیران)
export async function POST(request: NextRequest) {
  try {
    // بررسی نقش کاربر (فقط مدیران)
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      )
    }

    const { name, email, password, role } = await request.json()

    // اعتبارسنجی ورودی‌ها
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "نام، ایمیل و رمز عبور الزامی هستند" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل 6 کاراکتر باشد" },
        { status: 400 }
      )
    }

    // بررسی تکراری نبودن ایمیل
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً ثبت شده است" },
        { status: 400 }
      )
    }

    // بررسی نقش معتبر
    if (role && !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: "نقش نامعتبر است" },
        { status: 400 }
      )
    }

    // ایجاد کاربر جدید
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER'
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

    return NextResponse.json(
      { 
        message: "کاربر با موفقیت ایجاد شد",
        user
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: "خطا در ایجاد کاربر" },
      { status: 500 }
    )
  }
}
