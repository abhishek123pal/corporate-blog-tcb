import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { rateLimiter } from "@/lib/redis"

// ─────────────────────────────────────────
// ROUTE CONFIG
// ─────────────────────────────────────────

const ADMIN_ROUTES  = ["/admin", "/dashboard"]
const AUTH_ROUTES   = ["/login"]
const API_ROUTES    = ["/api"]
const AUTH_API      = ["/api/auth"] 

// Search engine crawlers — rate limit se exempt
const BOT_REGEX = /googlebot|bingbot|slurp|duckduckbot|yandexbot/i

// Public routes — bots ke liye freely accessible
const PUBLIC_ROUTES = ["/", "/blog", "/category", "/tags"]

function isAdminRoute  (p: string) { return ADMIN_ROUTES.some((r) => p.startsWith(r)) }
function isAuthRoute   (p: string) { return AUTH_ROUTES.some((r)  => p.startsWith(r)) }
function isApiRoute    (p: string) { return API_ROUTES.some((r)   => p.startsWith(r)) }
function isPublicRoute (p: string) { return PUBLIC_ROUTES.some((r) => p.startsWith(r)) || p === "/" }

// ─────────────────────────────────────────
// RATE LIMIT HELPER
// ─────────────────────────────────────────

async function applyRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl
  const userAgent = req.headers.get("user-agent") ?? ""

  // 1. Auth routes check (Sabse pehle, kyunki ye highest priority hai)
  if (AUTH_API.some(route => pathname.startsWith(route))) {
    return null
  }

  // 2. Identify User (Better IP extraction)
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(',')[0] : (req.headers.get("x-real-ip") ?? "anonymous")

  // 3. Bot Check (Don't trust, just relax the limit)
  const isBot = BOT_REGEX.test(userAgent)
  
  // Tip: Agar bot hai, toh limit badha do, par "null" return karke bypass mat do
  const { success, limit, remaining, reset } = await rateLimiter.limit(
    isBot ? `bot_${ip}` : ip 
  )

  const headers = new Headers({
    "X-RateLimit-Limit":     limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset":     reset.toString(),
  })

  if (!success) {
    headers.set("Retry-After", "10")
    return NextResponse.json(
      {
        success: false,
        error:   "Too many requests. Please slow down.",
        code:    "RATE_LIMIT_EXCEEDED",
      },
      { status: 429, headers }
    )
  }

  return null 
}
// ─────────────────────────────────────────
// MAIN MIDDLEWARE
// ─────────────────────────────────────────

export default auth(async (req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl
  const session      = req.auth

  // ── Step 1: API Routes — Rate Limit ───
  if (isApiRoute(pathname)) {
    const rateLimitResponse = await applyRateLimit(req)
    if (rateLimitResponse) return rateLimitResponse
  }

  // ── Step 2: Server Actions — Rate Limit
  // Server Actions POST request hoti hain
  // non-API routes par bhi
  const isServerAction = req.method === "POST"
    && req.headers.get("next-action") !== null

  if (isServerAction) {
    const rateLimitResponse = await applyRateLimit(req)
    if (rateLimitResponse) return rateLimitResponse
  }

  // ── Step 3: Public Routes ──────────────
  // Suspicious users ke liye rate limit
  // Bots ke liye freely accessible (SEO)
  if (isPublicRoute(pathname)) {
    const userAgent = req.headers.get("user-agent") ?? ""
    const isBot     = BOT_REGEX.test(userAgent)

    if (!isBot) {
      const rateLimitResponse = await applyRateLimit(req)
      if (rateLimitResponse) return rateLimitResponse
    }

    return NextResponse.next()
  }

  // ── Step 4: Auth Route Redirect ────────
  // Already logged in → homepage
  if (isAuthRoute(pathname) && session) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // ── Step 5: Admin + Dashboard Guard ───
  if (isAdminRoute(pathname)) {

    // Session nahi → login par bhejo
    if (!session) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Logged in but ADMIN nahi → unauthorized
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
  }

  // ── Step 6: Allow ──────────────────────
  return NextResponse.next()
})

// ─────────────────────────────────────────
// MATCHER
// Static files skip — Redis cost bachao
// ─────────────────────────────────────────

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.ico).*)",
  ],
}