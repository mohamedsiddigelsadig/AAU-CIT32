import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  // الخطوة السحرية: نتأكد أولاً إذا كان المستخدم لديه "كوكيز" مسجل دخول.
  // إذا لم يكن لديه، نرجع مباشرة بدون الاتصال بـ Supabase (هذا سيسرع الصفحات العامة بشكل جنوني).
  const hasAuthCookie = request.cookies.getAll().some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  )

  if (!hasAuthCookie) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // هذا الاستدعاء يحدث فقط للمستخدمين المسجلين دخولهم
  await supabase.auth.getUser()

  return supabaseResponse
}

// الخطوة الثانية: تحديد الصفحات التي يحتاج فيها الحارس للتدخل (الصفحات المحمية فقط)
export const config = {
  matcher: [
    /*
     * ضع هنا مسارات الصفحات التي تتطلب تسجيل دخول فقط.
     * مثلاً: لوحة التحكم، الملف الشخصي، الإعدادات.
     * لا تضع الصفحة الرئيسية أو صفحة تسجيل الدخول.
     */
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    // أضف أي مسار آخر محمي هنا
  ],
}
