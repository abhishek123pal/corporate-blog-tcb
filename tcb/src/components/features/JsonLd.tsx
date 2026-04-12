import type { PostWithAuthorAndCategory } from "@/types/post.types"

interface JsonLdProps {
  post: PostWithAuthorAndCategory
}

export function JsonLd({ post }: JsonLdProps) {
  const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  const schema = {
    "@context":           "https://schema.org",
    "@type":              "BlogPosting",
    "headline":           post.title,
    "description":        post.excerpt ?? "",
    "image":              post.coverImage
      ? [post.coverImage]
      : [`${BASE_URL}/og-default.png`],
   "datePublished": post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date(post.createdAt).toISOString(),
"dateModified":  new Date(post.updatedAt).toISOString(),

    "url":                `${BASE_URL}/blog/${post.slug}`,
    "inLanguage":         "en-US",
    "author": {
      "@type": "Person",
      "name":  post.author.name ?? "Anonymous",
      "url":   `${BASE_URL}/authors/${post.author.id}`,
    },
    "publisher": {
      "@type": "Organization",
      "name":  "The Corporate Blog",
      "url":   BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url":   `${BASE_URL}/logo.png`,
      },
    },
    "mainEntityOfPage": {
      "@type": "@WebPage",
      "@id":   `${BASE_URL}/blog/${post.slug}`,
    },
    "keywords": post.tags.map((t) => t.name).join(", "),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}