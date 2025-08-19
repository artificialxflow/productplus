import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "../../generated/prisma";
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'

const prisma = new PrismaClient()

interface ProductData {
  name: string;
  serialNumber: string;
  salePrice: number;
  quantity: number;
  discount: number;
  description: string;
  categoryId: number | null;
}

// آپلود و پردازش فایل
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const categoryId = formData.get('categoryId') as string

    if (!file) {
      return NextResponse.json(
        { error: "فایل انتخاب نشده است" },
        { status: 400 }
      )
    }

    // بررسی نوع فایل
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword' // .doc
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "نوع فایل پشتیبانی نمی‌شود. فقط فایل‌های Excel و Word مجاز هستند" },
        { status: 400 }
      )
    }

    // بررسی اندازه فایل (حداکثر 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "حجم فایل نباید بیشتر از 10 مگابایت باشد" },
        { status: 400 }
      )
    }

    let products: ProductData[] = []

    // پردازش فایل Excel
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // تبدیل به JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      // حذف سطر هدر
      const headers = jsonData[0] as string[]
      const dataRows = jsonData.slice(1) as any[][]
      
      // بررسی ستون‌های ضروری
      const requiredColumns = ['نام محصول', 'شماره سریال', 'قیمت فروش', 'موجودی']
      const columnIndexes = requiredColumns.map(col => headers.findIndex(h => h.includes(col)))
      
      if (columnIndexes.some(idx => idx === -1)) {
        return NextResponse.json(
          { error: "ستون‌های ضروری در فایل یافت نشد. لطفاً فایل را بررسی کنید" },
          { status: 400 }
        )
      }

      // تبدیل داده‌ها به فرمت محصول
      products = dataRows
        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map(row => {
          const [nameIndex, serialIndex, priceIndex, quantityIndex, discountIndex, descriptionIndex] = columnIndexes
          
          return {
            name: row[nameIndex]?.toString() || '',
            serialNumber: row[serialIndex]?.toString() || '',
            salePrice: parseFloat(row[priceIndex]) || 0,
            quantity: parseInt(row[quantityIndex]) || 0,
            discount: row[discountIndex] ? parseFloat(row[discountIndex]) : 0,
            description: row[descriptionIndex]?.toString() || '',
            categoryId: categoryId ? parseInt(categoryId) : null
          }
        })
        .filter(product => product.name && product.serialNumber)

    } 
    // پردازش فایل Word
    else if (file.type.includes('word') || file.type.includes('document')) {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      const text = result.value
      
      // تجزیه متن به خطوط
      const lines = text.split('\n').filter(line => line.trim())
      
      // پردازش خطوط و استخراج اطلاعات محصول
      products = lines
        .map(line => {
          // الگوی ساده برای استخراج اطلاعات محصول
          // این الگو باید بر اساس فرمت فایل Word شما تنظیم شود
          const match = line.match(/(.+?)\s+(\w+)\s+(\d+)\s+(\d+)/)
          if (match) {
            return {
              name: match[1].trim(),
              serialNumber: match[2].trim(),
              salePrice: parseFloat(match[3]) || 0,
              quantity: parseInt(match[4]) || 0,
              discount: 0,
              description: '',
              categoryId: categoryId ? parseInt(categoryId) : null
            }
          }
          return null
        })
        .filter(product => product !== null)
    }

    if (products.length === 0) {
      return NextResponse.json(
        { error: "هیچ محصولی از فایل استخراج نشد" },
        { status: 400 }
      )
    }

    // اعتبارسنجی داده‌ها
    const validationErrors: string[] = []
    products.forEach((product, index) => {
      if (!product.name || product.name.length < 2) {
        validationErrors.push(`سطر ${index + 1}: نام محصول نامعتبر`)
      }
      if (!product.serialNumber) {
        validationErrors.push(`سطر ${index + 1}: شماره سریال الزامی است`)
      }
      if (product.salePrice <= 0) {
        validationErrors.push(`سطر ${index + 1}: قیمت فروش باید بیشتر از صفر باشد`)
      }
      if (product.quantity < 0) {
        validationErrors.push(`سطر ${index + 1}: موجودی نمی‌تواند منفی باشد`)
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "خطاهای اعتبارسنجی در فایل یافت شد",
          details: validationErrors
        },
        { status: 400 }
      )
    }

    // بررسی تکراری نبودن شماره سریال
    const existingSerialNumbers = await prisma.product.findMany({
      where: {
        serialNumber: {
          in: products.map(p => p.serialNumber)
        }
      },
      select: { serialNumber: true }
    })

    if (existingSerialNumbers.length > 0) {
      const duplicates = existingSerialNumbers.map((p: { serialNumber: string }) => p.serialNumber)
      return NextResponse.json(
        { 
          error: "شماره سریال‌های زیر قبلاً در سیستم ثبت شده‌اند",
          duplicates
        },
        { status: 400 }
      )
    }

    // ذخیره محصولات در دیتابیس
    const createdProducts = await prisma.product.createMany({
      data: products,
      skipDuplicates: false
    })

    return NextResponse.json(
      { 
        message: `${createdProducts.count} محصول با موفقیت وارد شد`,
        importedCount: createdProducts.count,
        totalCount: products.length
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: "خطا در پردازش فایل" },
      { status: 500 }
    )
  }
}
