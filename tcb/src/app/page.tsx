import { Suspense } from "react"
import Link from "next/link"
import { getPosts } from "@/services/post.service"
import BlogCard, { BlogCardSkeleton } from "@/components/features/BlogCard"
import type { PostWithAuthor } from "@/types/post.types"

// ─────────────────────────────────────────
// SERVER COMPONENT: DATA FETCHING
// ─────────────────────────────────────────

async function PostsGrid() {
  const response = await getPosts(1, 6)

  if (!response.success || !response.data) {
    return (
      <div className="col-span-full text-center py-20 text-white/20 border border-white/5 rounded-2xl bg-white/1">
        Failed to load insights.
      </div>
    )
  }

  const { posts } = response.data

  if (posts.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-white/20 border border-white/5 rounded-2xl bg-white/1">
        No articles published yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post: PostWithAuthor) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  )
}

/**
 * Shaking fix karne ke liye yahan min-height aur aspect-ratio maintain karna zaroori hai.
 */
function PostsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={"skeleton-" + i} className="w-full min-h-100">
           <BlogCardSkeleton />
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// MAIN PAGE (SERVER COMPONENT)
// ─────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black selection:bg-white/10 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        
        {/* Header Section */}
        <header className="mb-24 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
              The Corporate Blog
            </span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9] mb-10">
            Insights for the <br />
            <span className="text-white/20 italic font-serif pr-4">modern builder.</span>
          </h1>
          
          <p className="text-white/40 text-xl md:text-2xl leading-relaxed max-w-2xl font-light">
            Engineering-focused deep dives into system architecture, 
            full-stack patterns, and technical leadership.
          </p>
        </header>

        {/* Section Divider & Title */}
        <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">
              Directory
            </h2>
            <p className="text-xl font-medium text-white/90">Latest Articles</p>
          </div>
          
          <Link
            href="/blog"
            className="group flex items-center gap-3 text-sm text-white/30 hover:text-white transition-all duration-300"
          >
            <span className="font-medium">View Archive</span>
            <div className="w-8 h-px bg-white/10 group-hover:w-12 group-hover:bg-white transition-all duration-300" />
          </Link>
        </div>

        {/* SHAKY FIX: Wrapper div with min-height ensures 
            footer doesn't jump up while loading.
        */}
        <div className="relative min-h-150 w-full">
          <Suspense fallback={<PostsGridSkeleton />}>
            <PostsGrid />
          </Suspense>
        </div>
      </div>
    </main>
  )
}








// import { Suspense } from "react"
// import Link from "next/link"
// import { getPosts } from "@/services/post.service"
// import BlogCard, { BlogCardSkeleton } from "@/components/features/BlogCard"
// import type { PostWithAuthor } from "@/types/post.types"

// // ─────────────────────────────────────────
// // SERVER COMPONENT: DATA FETCHING
// // ─────────────────────────────────────────

// async function PostsGrid() {
//   const response = await getPosts(1, 6)

//   if (!response.success || !response.data) {
//     return (
//       <div className="col-span-full text-center py-20 text-white/20 border border-white/5 rounded-2xl bg-white/[0.01]">
//         Failed to load insights.
//       </div>
//     )
//   }

//   const { posts } = response.data

//   if (posts.length === 0) {
//     return (
//       <div className="col-span-full text-center py-20 text-white/20 border border-white/5 rounded-2xl bg-white/[0.01]">
//         No articles published yet.
//       </div>
//     )
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//       {posts.map((post: PostWithAuthor) => (
//         <BlogCard key={post.id} post={post} />
//       ))}
//     </div>
//   )
// }

// function PostsGridSkeleton() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//       {Array.from({ length: 6 }).map((_, i) => (
//         <BlogCardSkeleton key={"skeleton-" + i} />
//       ))}
//     </div>
//   )
// }

// // ─────────────────────────────────────────
// // MAIN PAGE (SERVER COMPONENT)
// // ─────────────────────────────────────────

// export default function HomePage() {
//   return (
//     <main className="min-h-screen bg-black selection:bg-white/10">
//       <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        
//         {/* Header Section */}
//         <header className="mb-24 max-w-3xl">
//           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8">
//             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
//             <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
//               The Corporate Blog
//             </span>
//           </div>
          
//           <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9] mb-10">
//             Insights for the <br />
//             <span className="text-white/20 italic font-serif pr-4">modern builder.</span>
//           </h1>
          
//           <p className="text-white/40 text-xl md:text-2xl leading-relaxed max-w-2xl font-light">
//             Engineering-focused deep dives into system architecture, 
//             full-stack patterns, and technical leadership.
//           </p>
//         </header>

//         {/* Section Divider & Title */}
//         <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-8">
//           <div className="space-y-1">
//             <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/20">
//               Directory
//             </h2>
//             <p className="text-xl font-medium text-white/90">Latest Articles</p>
//           </div>
          
//           <Link
//             href="/blog"
//             className="group flex items-center gap-3 text-sm text-white/30 hover:text-white transition-all duration-300"
//           >
//             <span className="font-medium">View Archive</span>
//             <div className="w-8 h-px bg-white/10 group-hover:w-12 group-hover:bg-white transition-all duration-300" />
//           </Link>
//         </div>

//         {/* Dynamic Content */}
//         <Suspense fallback={<PostsGridSkeleton />}>
//           <PostsGrid />
//         </Suspense>
//       </div>
//     </main>
//   )
// }