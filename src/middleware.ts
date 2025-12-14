import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Rotas públicas
        const publicRoutes = ['/login', '/register', '/api/auth', '/api/webhook']
        const isPublicRoute = publicRoutes.some((route) =>
          pathname.startsWith(route)
        )

        if (isPublicRoute) {
          return true
        }

        // Requer autenticação para outras rotas
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}
