import { getPostBySlug, incrementViewCount } from "@/services/post.service"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link" // ✅ Link import zaroori hai
import { formatDistanceToNow } from "date-fns"
import { Eye } from "lucide-react"
import { JsonLd } from "@/components/features/JsonLd"
import type { Metadata } from "next"

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const response = await getPostBySlug(slug)
  if (!response.success) return { title: "Post Not Found" }
  
  const post = response.data
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      type: "article",
      url: `${BASE_URL}/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt ?? undefined,
      
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
modifiedTime:  new Date(post.updatedAt).toISOString(),

      authors: post.author.name ? [post.author.name] : [],
      tags: post.tags.map((t: { name: string }) => t.name),
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImage ? [post.coverImage] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const response = await getPostBySlug(slug)
  
  if (!response.success) notFound()

  const post = response.data
  const timeAgo = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : null

  // Background mein view count badhao
  void incrementViewCount(post.id)

  return (
    <>
      <JsonLd post={post} />
      <article className="max-w-3xl mx-auto px-6 py-16">

        {/* --- TAGS --- */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-white/40 uppercase tracking-wider hover:border-white/25 hover:text-white/60 transition-all"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-medium text-white/90 leading-tight mb-6">
          {post.title}
        </h1>

        {/* --- AUTHOR & STATS --- */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {post.author.image && (
              <Image
                src={post.author.image}
                alt={post.author.name ?? "Author"}
                width={32}
                height={32}
                className="rounded-full bg-white/5"
              />
            )}
            <div>
              <p className="text-sm text-white/70">{post.author.name}</p>
              {timeAgo && (
                <p className="text-xs text-white/30">{timeAgo}</p>
              )}
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-white/30">
            <Eye size={12} />
            {post.viewCount.toLocaleString()} views
          </span>
        </div>

        {/* --- COVER IMAGE --- */}
        {post.coverImage && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-10 bg-white/5 border border-white/5">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority // Hero image ke liye priority true rakha hai SEO ke liye
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {/* --- CONTENT --- */}
        <div className="flex flex-col gap-6">
          {post.content.split("\n\n").map((para, i) => (
            <p key={i} className="text-white/60 leading-relaxed text-lg">
              {para}
            </p>
          ))}
        </div>

        {/* --- FOOTER / BACK BUTTON --- */}
        <div className="mt-16 pt-8 border-t border-white/8">
          <Link
            href="/blog"
            className="text-sm text-white/25 hover:text-white/50 transition-colors inline-flex items-center gap-2"
          >
            ← Back to all articles
          </Link>
        </div>

      </article>
    </>
  )
}