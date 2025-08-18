import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: "خروج موفقیت‌آمیز" },
      { status: 200 }
    )

    // حذف cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0
    })

    return response

  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "خطا در خروج از سیستم" },
      { status: 500 }
    )
  }
}
