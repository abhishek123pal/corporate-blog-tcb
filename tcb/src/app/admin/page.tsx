// ✅ Fix 3: Hamesha fresh data — cache se nahi

import { Suspense } from "react"
import { StatCards, StatCardsSkeleton } from "@/components/admin/StatCards"
import { PostTable, PostTableSkeleton } from "@/components/admin/PostTable"
import { getPosts } from "@/services/post.service"
import Link from "next/link"
import { PenLine } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate=0
async function AdminPostTable() {
  const response = await getPosts(1, 20)
  if (!response.success) return (
    <p className="text-sm text-white/30">Failed to load posts.</p>
  )
  return <PostTable posts={response.data.posts} />
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-white/80">
            Dashboard
          </h1>
          <p className="text-sm text-white/30 mt-0.5">
            Manage your content and monitor performance.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/8 border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/12 transition-all"
        >
          <PenLine size={14} />
          New Post
        </Link>
      </div>

      {/* Stat Cards */}
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards />
      </Suspense>

      {/* Posts Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-white/50">
            All Posts
          </h2>
          <Link
            href="/admin/posts"
            className="text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            View all
          </Link>
        </div>
        <Suspense fallback={<PostTableSkeleton />}>
          <AdminPostTable />
        </Suspense>
      </div>

    </div>
  )
}