"use server"
import { redis } from "@/lib/redis"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

import { z } from "zod"
import type { ApiResponse } from "@/types/api.types"

// ─────────────────────────────────────────
// ZOD SCHEMAS
// ─────────────────────────────────────────

const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  image: z.string().url("Invalid URL").optional().or(z.literal("")),
})

const SiteSettingsSchema = z.object({
  siteTitle: z.string().min(1, "Site title is required").max(100),
  description: z.string().max(300).optional(),
  keywords: z.string().max(200).optional(),
})

const SocialLinksSchema = z.object({
  githubUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
})

export type ProfileInput = z.infer<typeof ProfileSchema>
export type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>
export type SocialLinksInput = z.infer<typeof SocialLinksSchema>

// ─────────────────────────────────────────
// GET SITE SETTINGS
// ─────────────────────────────────────────

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    })
    return { success: true as const, data: settings }
  } catch (error) {
    console.error("GET_SETTINGS_ERROR:", error)
    return { success: false as const, error: "Failed to fetch settings" }
  }
}

// ─────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────

export async function updateProfile(
  input: ProfileInput
): Promise<ApiResponse<{ name: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" }
    }

    const parsed = ProfileSchema.safeParse(input)
    if (!parsed.success) {
      // ✅ FIX: Zod uses .issues, not .errors
      return { success: false, error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        image: parsed.data.image || undefined,
      },
    })

    revalidatePath("/admin")
    revalidatePath("/admin/settings")

    return { success: true, data: { name: parsed.data.name } }
  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR:", error)
    return { success: false, error: "Failed to update profile", code: "SERVER_ERROR" }
  }
}

// ─────────────────────────────────────────
// UPDATE SITE SETTINGS
// ─────────────────────────────────────────

export async function updateSiteSettings(
  input: SiteSettingsInput
): Promise<ApiResponse<{ siteTitle: string }>> {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Admin only", code: "UNAUTHORIZED" }
    }

    const parsed = SiteSettingsSchema.safeParse(input)
    if (!parsed.success) {
      // ✅ FIX: Zod issues access
      return { success: false, error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" }
    }

    // ✅ FIX: Model SiteSettings is accessed via prisma.siteSettings
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    })

    revalidatePath("/")
    revalidatePath("/admin/settings")

    return { success: true, data: { siteTitle: parsed.data.siteTitle } }
  } catch (error) {
    console.error("UPDATE_SETTINGS_ERROR:", error)
    return { success: false, error: "Failed to update settings", code: "SERVER_ERROR" }
  }
}

// ─────────────────────────────────────────
// UPDATE SOCIAL LINKS
// ─────────────────────────────────────────

export async function updateSocialLinks(
  input: SocialLinksInput
): Promise<ApiResponse<{ updated: boolean }>> {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Admin only", code: "UNAUTHORIZED" }
    }

    const parsed = SocialLinksSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message, code: "VALIDATION_ERROR" }
    }

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: parsed.data,
      create: { id: "singleton", ...parsed.data },
    })

    revalidatePath("/admin/settings")

    return { success: true, data: { updated: true } }
  } catch (error) {
    console.error("UPDATE_SOCIALS_ERROR:", error)
    return { success: false, error: "Failed to update social links", code: "SERVER_ERROR" }
  }
}

// ─────────────────────────────────────────
// DELETE ACCOUNT
// ─────────────────────────────────────────
export async function deleteAccount(): Promise<ApiResponse<{ deleted: boolean }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" }
    }

    const userId = session.user.id

    // ✅ Sahi order mein delete karo
    await prisma.post.deleteMany({ where: { authorId: userId } })
    await prisma.session.deleteMany({ where: { userId } })
    await prisma.account.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })

    // ✅ Cache bhi clear karo
    try {
      const keys = await redis.keys("tcb:*")
      if (keys.length > 0) await redis.del(...keys)
    } catch { }

    revalidatePath("/")
    revalidatePath("/admin")

    return { success: true, data: { deleted: true } }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[deleteAccount]", message)
    return { success: false, error: "Failed to delete account", code: "SERVER_ERROR" }
  }
}













// export async function deleteAccount(): Promise<ApiResponse<{ deleted: boolean }>> {
//   try {
//     const session = await auth()
//     if (!session?.user?.id) {
//       return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" }
//     }

//     await prisma.user.delete({
//       where: { id: session.user.id },
//     })

//     return { success: true, data: { deleted: true } }
//   } catch (error) {
//     console.error("DELETE_ACCOUNT_ERROR:", error)
//     return { success: false, error: "Failed to delete account", code: "SERVER_ERROR" }
//   }
// }














// "use server"

// import prisma from "@/lib/prisma"
// import { auth } from "@/lib/auth"
// import { revalidatePath } from "next/cache"
// import { z } from "zod"
// import type { ApiResponse } from "@/types/api.types"

// // ─────────────────────────────────────────
// // ZOD SCHEMAS
// // ─────────────────────────────────────────

// const ProfileSchema = z.object({
//   name:  z.string().min(1, "Name is required").max(50),
//   image: z.string().url("Invalid URL").optional().or(z.literal("")),
// })

// const SiteSettingsSchema = z.object({
//   siteTitle:   z.string().min(1).max(100),
//   description: z.string().max(300).optional(),
//   keywords:    z.string().max(200).optional(),
// })

// const SocialLinksSchema = z.object({
//   githubUrl:   z.string().url().optional().or(z.literal("")),
//   twitterUrl:  z.string().url().optional().or(z.literal("")),
//   linkedinUrl: z.string().url().optional().or(z.literal("")),
// })

// // ─────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────

// export type ProfileInput      = z.infer<typeof ProfileSchema>
// export type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>
// export type SocialLinksInput  = z.infer<typeof SocialLinksSchema>

// // ─────────────────────────────────────────
// // GET SITE SETTINGS
// // ─────────────────────────────────────────

// export async function getSiteSettings() {
//   try {
//     const settings = await prisma.siteSettings.upsert({
//       where:  { id: "singleton" },
//       update: {},
//       create: { id: "singleton" },
//     })
//     return { success: true as const, data: settings }
//   } catch {
//     return { success: false as const, error: "Failed to fetch settings" }
//   }
// }

// // ─────────────────────────────────────────
// // UPDATE PROFILE
// // ─────────────────────────────────────────

// export async function updateProfile(
//   input: ProfileInput
// ): Promise<ApiResponse<{ name: string }>> {
//   try {
//     const session = await auth()
//     if (!session?.user?.id) {
//       return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" }
//     }

//     const parsed = ProfileSchema.safeParse(input)
//     if (!parsed.success) {
//       return { success: false, error: parsed.error.errors[0].message, code: "VALIDATION_ERROR" }
//     }

//     await prisma.user.update({
//       where: { id: session.user.id },
//       data:  {
//         name:  parsed.data.name,
//         image: parsed.data.image || undefined,
//       },
//     })

//     revalidatePath("/admin")
//     revalidatePath("/admin/settings")

//     return { success: true, data: { name: parsed.data.name } }
//   } catch {
//     return { success: false, error: "Failed to update profile", code: "SERVER_ERROR" }
//   }
// }

// // ─────────────────────────────────────────
// // UPDATE SITE SETTINGS
// // ─────────────────────────────────────────

// export async function updateSiteSettings(
//   input: SiteSettingsInput
// ): Promise<ApiResponse<{ siteTitle: string }>> {
//   try {
//     const session = await auth()
//     if (session?.user?.role !== "ADMIN") {
//       return { success: false, error: "Admin only", code: "UNAUTHORIZED" }
//     }

//     const parsed = SiteSettingsSchema.safeParse(input)
//     if (!parsed.success) {
//       return { success: false, error: parsed.error.errors[0].message, code: "VALIDATION_ERROR" }
//     }

//     await prisma.siteSettings.upsert({
//       where:  { id: "singleton" },
//       update: parsed.data,
//       create: { id: "singleton", ...parsed.data },
//     })

//     revalidatePath("/")
//     revalidatePath("/admin/settings")

//     return { success: true, data: { siteTitle: parsed.data.siteTitle } }
//   } catch {
//     return { success: false, error: "Failed to update settings", code: "SERVER_ERROR" }
//   }
// }

// // ─────────────────────────────────────────
// // UPDATE SOCIAL LINKS
// // ─────────────────────────────────────────

// export async function updateSocialLinks(
//   input: SocialLinksInput
// ): Promise<ApiResponse<{ updated: boolean }>> {
//   try {
//     const session = await auth()
//     if (session?.user?.role !== "ADMIN") {
//       return { success: false, error: "Admin only", code: "UNAUTHORIZED" }
//     }

//     const parsed = SocialLinksSchema.safeParse(input)
//     if (!parsed.success) {
//       return { success: false, error: parsed.error.errors[0].message, code: "VALIDATION_ERROR" }
//     }

//     await prisma.siteSettings.upsert({
//       where:  { id: "singleton" },
//       update: parsed.data,
//       create: { id: "singleton", ...parsed.data },
//     })

//     revalidatePath("/admin/settings")

//     return { success: true, data: { updated: true } }
//   } catch {
//     return { success: false, error: "Failed to update social links", code: "SERVER_ERROR" }
//   }
// }

// // ─────────────────────────────────────────
// // DELETE ACCOUNT
// // ─────────────────────────────────────────

// export async function deleteAccount(): Promise<ApiResponse<{ deleted: boolean }>> {
//   try {
//     const session = await auth()
//     if (!session?.user?.id) {
//       return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" }
//     }

//     await prisma.user.delete({
//       where: { id: session.user.id },
//     })

//     return { success: true, data: { deleted: true } }
//   } catch {
//     return { success: false, error: "Failed to delete account", code: "SERVER_ERROR" }
//   }
// }