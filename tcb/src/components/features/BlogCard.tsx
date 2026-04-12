// src/components/features/BlogCard.tsx
import Image from "next/image"
import Link from "next/link"
import { Eye, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { PostWithAuthor } from "@/types/post.types"

// ─────────────────────────────────────────
// BLOG CARD
// ─────────────────────────────────────────

export default function BlogCard({ post }: { post: PostWithAuthor }) {
  const timeAgo = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-[#111] overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover Image */}
      <div className="relative aspect-video overflow-hidden bg-white/5">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            loading="eager"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-white/5 to-white/10 flex items-center justify-center">
            <span className="text-white/10 text-4xl font-bold">
              {post.title[0]}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-[#111]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">

        {/* Tags */}
        {(post as any).tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(post as any).tags.slice(0, 2).map((tag: any) => (
              <span
                key={tag.id}
                className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40 uppercase tracking-wider"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-base font-medium text-white/85 leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name ?? "Author"}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {post.author.name?.[0] ?? "A"}
              </div>
            )}
            <span className="text-xs text-white/35">
              {post.author.name ?? "Anonymous"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-white/25">
            <span className="flex items-center gap-1 text-xs">
              <Eye size={11} />
              {post.viewCount.toLocaleString()}
            </span>
            {timeAgo && (
              <span className="flex items-center gap-1 text-xs">
                <Clock size={11} />
                {timeAgo}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────

export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#111] overflow-hidden animate-pulse">
      <div className="aspect-video bg-white/5" />
      <div className="flex flex-col p-5 gap-3">
        <div className="flex gap-1.5">
          <div className="h-4 w-14 rounded-full bg-white/5" />
          <div className="h-4 w-10 rounded-full bg-white/5" />
        </div>
        <div className="h-4 w-4/5 rounded bg-white/8" />
        <div className="h-4 w-3/5 rounded bg-white/5" />
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-2/3 rounded bg-white/5" />
        <div className="flex justify-between mt-auto pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/8" />
            <div className="h-3 w-20 rounded bg-white/5" />
          </div>
          <div className="h-3 w-16 rounded bg-white/5" />
        </div>
      </div>
    </div>
  )
}