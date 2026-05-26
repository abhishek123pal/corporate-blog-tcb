import type { MetadataRoute } from "next"
import prisma from "@/lib/prisma"

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // ── Static routes ──────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url:              `${BASE_URL}/`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         1.0,
    },
    {
      url:              `${BASE_URL}/blog`,
      lastModified:     new Date(),
      changeFrequency:  "daily",
      priority:         0.9,
    },
    {
      url:              `${BASE_URL}/about`,
      lastModified:     new Date(),
      changeFrequency:  "monthly",
      priority:         0.5,
    },
  ]

  // ── Dynamic post routes ────────────────────────
  const posts = await prisma.post.findMany({
    where:   { status: "PUBLISHED" },
    select:  { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  })

 const postRoutes: MetadataRoute.Sitemap = posts.map((post: { slug: string; updatedAt: string | Date }) => ({
    url:             `${BASE_URL}/blog/${post.slug}`,
    lastModified:    post.updatedAt,
    changeFrequency: "weekly",
    priority:        0.8,
  }))

  // ── Tag routes ─────────────────────────────────
  const tags = await prisma.tag.findMany({
    select: { slug: true },
  })

  const tagRoutes: MetadataRoute.Sitemap = tags.map((tag: { slug: string }) => ({
    url:             `${BASE_URL}/blog?tag=${tag.slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly",
    priority:        0.6,
  }))

  return [...staticRoutes, ...postRoutes, ...tagRoutes]
}