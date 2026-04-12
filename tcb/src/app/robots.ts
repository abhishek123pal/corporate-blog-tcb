import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // ── Public crawlers — allow everything except admin
        userAgent:  "*",
        allow:      ["/", "/blog", "/blog/", "/about"],
        disallow:   [
          "/admin",
          "/admin/",
          "/admin/*",
          "/api/",
          "/unauthorized",
          "/_next/",
        ],
      },
      {
        // ── Block GPTBot specifically
        userAgent: "GPTBot",
        disallow:  ["/"],
      },
    ],
    sitemap:  `${BASE_URL}/sitemap.xml`,
    host:     BASE_URL,
  }
}