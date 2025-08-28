import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../../lib/prisma";
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// دریافت تصاویر محصول
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است" },
        { status: 400 }
      )
    }

    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(images)

  } catch (error) {
    console.error('Error fetching product images:', error)
    return NextResponse.json(
      { error: "خطا در دریافت تصاویر" },
      { status: 500 }
    )
  }
}

// آپلود تصویر جدید
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است" },
        { status: 400 }
      )
    }

    // بررسی وجود محصول
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: "محصول یافت نشد" },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const alt = formData.get('alt') as string
    const isPrimary = formData.get('isPrimary') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: "فایل تصویر الزامی است" },
        { status: 400 }
      )
    }

    // اعتبارسنجی نوع فایل
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "فقط فایل‌های تصویری مجاز هستند" },
        { status: 400 }
      )
    }

    // اعتبارسنجی اندازه فایل (حداکثر 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "حجم فایل نباید بیشتر از 5MB باشد" },
        { status: 400 }
      )
    }

    // ایجاد نام فایل منحصر به فرد
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `product_${productId}_${timestamp}.${extension}`

    // ایجاد مسیر ذخیره‌سازی
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ذخیره فایل
    await writeFile(filePath, buffer)

    // اگر تصویر اصلی است، بقیه را غیر اصلی کن
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false }
      })
    }

    // ذخیره در دیتابیس
    const image = await prisma.productImage.create({
      data: {
        productId,
        url: `/uploads/products/${fileName}`,
        alt: alt || product.name,
        isPrimary,
        order: 0
      }
    })

    return NextResponse.json({
      message: "تصویر با موفقیت آپلود شد",
      image
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: "خطا در آپلود تصویر" },
      { status: 500 }
    )
  }
}

// بروزرسانی ترتیب تصاویر
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است" },
        { status: 400 }
      )
    }

    const { imageId, order, isPrimary, alt } = await request.json()

    if (isPrimary) {
      // اگر تصویر اصلی است، بقیه را غیر اصلی کن
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false }
      })
    }

    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        order: order || 0,
        isPrimary: isPrimary || false,
        alt: alt || undefined
      }
    })

    return NextResponse.json({
      message: "تصویر بروزرسانی شد",
      image: updatedImage
    })

  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: "خطا در بروزرسانی تصویر" },
      { status: 500 }
    )
  }
}

// حذف تصویر
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است" },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json(
        { error: "شناسه تصویر الزامی است" },
        { status: 400 }
      )
    }

    const image = await prisma.productImage.findUnique({
      where: { id: parseInt(imageId) }
    })

    if (!image) {
      return NextResponse.json(
        { error: "تصویر یافت نشد" },
        { status: 404 }
      )
    }

    // حذف فایل فیزیکی
    try {
      const filePath = join(process.cwd(), 'public', image.url)
      if (existsSync(filePath)) {
        await writeFile(filePath, '')
      }
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError)
    }

    // حذف از دیتابیس
    await prisma.productImage.delete({
      where: { id: parseInt(imageId) }
    })

    return NextResponse.json({
      message: "تصویر با موفقیت حذف شد"
    })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: "خطا در حذف تصویر" },
      { status: 500 }
    )
  }
}
