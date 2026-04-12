import { Suspense } from "react"
import { getPosts } from "@/services/post.service"
import { PostTable, PostTableSkeleton } from "@/components/admin/PostTable"
import Link from "next/link"
import { PenLine } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "All Posts" }

// ✅ Fix 3: Hamesha fresh data
export const dynamic = "force-dynamic"

async function AllPostsTable() {
  const [pub, draft, arch] = await Promise.all([
    getPosts(1, 50, undefined, "PUBLISHED"),
    getPosts(1, 50, undefined, "DRAFT"),
    getPosts(1, 50, undefined, "ARCHIVED"),
  ])

  const allPosts = [
    ...(pub.success   ? pub.data.posts   : []),
    ...(draft.success ? draft.data.posts : []),
    ...(arch.success  ? arch.data.posts  : []),
  ]

  if (allPosts.length === 0) {
    return (
      <p className="text-sm text-white/30 py-10 text-center">
        No posts found.
      </p>
    )
  }

  return <PostTable posts={allPosts} />
}

export default function AdminPostsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-white/80">Posts</h1>
          <p className="text-sm text-white/30 mt-0.5">
            Create, edit and manage all your content.
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
      <Suspense fallback={<PostTableSkeleton />}>
        <AllPostsTable />
      </Suspense>
    </div>
  )
}
