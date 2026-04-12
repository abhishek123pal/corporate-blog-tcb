import { Suspense } from "react"
import { getPosts } from "@/services/post.service"
import BlogCard, { BlogCardSkeleton } from "@/components/features/BlogCard"
import { FilterBar } from "@/components/features/FilterBar"
import { Pagination } from "@/components/features/Pagination"
import prisma from "@/lib/prisma"
import type { Metadata } from "next"
import type { PostWithAuthor } from "@/types/post.types"
import { SearchX } from "lucide-react"

type SearchParams = Promise<{
  page?:   string
  tag?:    string
  search?: string
}>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const { tag, search, page } = await searchParams
  const title = search
    ? `Search: "${search}"`
    : tag
    ? `Topic: ${tag}`
    : "All Articles"
  return {
    title,
    description: `Browse ${title.toLowerCase()} on The Corporate Blog. Page ${page ?? 1}.`,
  }
}

async function PostsGrid({
  page,
  tag,
  search,
}: {
  page:    number
  tag?:    string
  search?: string
}) {
  const PAGE_SIZE = 9
  const response  = await getPosts(page, PAGE_SIZE, tag, undefined, search)

  if (!response.success) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
        <SearchX size={32} className="text-white/15" />
        <p className="text-white/30 text-sm">Failed to load posts.</p>
      </div>
    )
  }

  const { posts, total } = response.data

  if (posts.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
        <SearchX size={40} className="text-white/10" />
        <div className="text-center">
          <p className="text-white/40 font-medium mb-1">No results found</p>
          <p className="text-white/20 text-sm">
            {search
              ? `No articles match "${search}"`
              : tag
              ? `No articles in this topic yet`
              : "No articles published yet"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {posts.map((post: PostWithAuthor) => (
        <BlogCard key={post.id} post={post} />
      ))}
      <div className="col-span-full mt-8">
        <Pagination total={total} page={page} pageSize={PAGE_SIZE} />
      </div>
    </>
  )
}

function PostsGridSkeleton() {
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { page: pageStr, tag, search } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10))

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-xs tracking-widest uppercase text-white/25 mb-3">
          The Corporate Blog
        </p>
        <h1 className="text-3xl font-medium text-white/85 mb-2">
          {search
            ? `Results for "${search}"`
            : tag
            ? `Topic: ${tag}`
            : "All Articles"}
        </h1>
        <p className="text-white/35 text-sm">
          Insights on technology, engineering, and the modern web.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-56 shrink-0">
          <div className="lg:sticky lg:top-24">
            <FilterBar
              tags={tags}
              activeTag={tag}
              activeSearch={search}
            />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <Suspense
              fallback={<PostsGridSkeleton />}
              key={`${page}-${tag}-${search}`}
            >
              <PostsGrid page={page} tag={tag} search={search} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
