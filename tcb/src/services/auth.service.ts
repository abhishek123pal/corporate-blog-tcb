"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import type { AuthUser } from "@/types/auth.types"
import type { ApiResponse } from "@/types/api.types"

// ─────────────────────────────────────────
// GET CURRENT USER
// Session se user data fetch karo
// ─────────────────────────────────────────

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await auth()
    if (!session?.user?.id) return null

    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, role: true },
    })

    return user as AuthUser | null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────
// ROLE CHECKS
// ─────────────────────────────────────────

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === "ADMIN"
}

export async function isAuthor(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === "AUTHOR" || user?.role === "ADMIN"
}

// ─────────────────────────────────────────
// REQUIRE AUTH — Server Actions mein use karo
// Agar unauthorized hai to error return karo
// ─────────────────────────────────────────

export async function requireAdmin(): Promise<ApiResponse<AuthUser>> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: "Not authenticated", code: "UNAUTHORIZED" }
  }

  if (user.role !== "ADMIN") {
    return { success: false, error: "Admin access required", code: "UNAUTHORIZED" }
  }

  return { success: true, data: user }
}