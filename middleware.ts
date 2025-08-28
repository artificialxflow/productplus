import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// مسیرهایی که نیاز به احراز هویت ندارند
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify'
]

// مسیرهایی که فقط مدیران می‌توانند به آن‌ها دسترسی داشته باشند
const adminPaths = [
  '/admin',
  '/api/admin'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // بررسی اینکه آیا مسیر عمومی است یا نه
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  )

  // اگر مسیر عمومی است، اجازه عبور بده
  if (isPublicPath) {
    return NextResponse.next()
  }

  // دریافت token از cookie
  const token = request.cookies.get('auth-token')?.value

  // اگر token وجود ندارد، به صفحه ورود هدایت کن
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // تایید JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    )
    
    const { payload } = await jwtVerify(token, secret)
    
    // بررسی اینکه آیا مسیر نیاز به دسترسی مدیر دارد
    const isAdminPath = adminPaths.some(path => 
      pathname.startsWith(path)
    )

    // اگر مسیر نیاز به دسترسی مدیر دارد و کاربر مدیر نیست
    if (isAdminPath && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // اضافه کردن اطلاعات کاربر به headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId as string)
    requestHeaders.set('x-user-email', payload.email as string)
    requestHeaders.set('x-user-role', payload.role as string)

    // ادامه درخواست با اطلاعات کاربر
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('JWT verification failed:', error)
    
    // حذف cookie نامعتبر
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: true, // همیشه true در سرور
      sameSite: 'strict',
      maxAge: 0
    })
    
    return response
  }
}

// تنظیم مسیرهایی که middleware روی آن‌ها اجرا می‌شود
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
