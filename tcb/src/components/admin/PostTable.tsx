"use client"

import React, { useState, useTransition, useOptimistic } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { deletePost } from "@/services/post.service"
import type { PostWithAuthor } from "@/types/post.types"
import type { PostStatus } from "@prisma/client"

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

interface PostTableProps {
  posts: PostWithAuthor[]
}

interface StatusBadgeProps {
  status: PostStatus
}

// Extend local type contract to handle structural pipeline states safely
type OptimisticPost = PostWithAuthor & { isDeleting?: boolean }

// ─────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────

function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<PostStatus, { label: string; className: string }> = {
    PUBLISHED: {
      label:     "Published",
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    DRAFT: {
      label:     "Draft",
      className: "bg-white/5 text-white/40 border-white/10",
    },
    ARCHIVED: {
      label:     "Archived",
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  }

  const { label, className } = config[status]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${className}`}>
      {label}
    </span>
  )
}

// ─────────────────────────────────────────
// POST TABLE — Production Optimistic UI
// ─────────────────────────────────────────

export function PostTable({ posts }: PostTableProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  // Optimistically toggle an execution flag inside the collection item wrapper
  const [optimisticPosts, setOptimisticPostState] = useOptimistic(
    posts as OptimisticPost[],
    (currentPosts: OptimisticPost[], targetId: string) =>
      currentPosts.map((p) => (p.id === targetId ? { ...p, isDeleting: true } : p))
  )

  function handleDeleteClick(postId: string) {
    if (isPending) return

    // Double confirmation sequence check
    if (confirmId !== postId) {
      setConfirmId(postId)
      setTimeout(() => setConfirmId(null), 3000)
      return
    }

    setConfirmId(null)

    startTransition(async () => {
      // Synchronously flags item and forces immediate UI layout styling state shift
      setOptimisticPostState(postId)

      const result = await deletePost(postId)

      if (!result.success) {
        // You could dispatch a toast notification hook instance here
        console.error("Delete failed:", result.error)
      }
    })
  }

  // Filter out posts that are completely done or optimistically marked as empty downstream
  const visiblePosts = optimisticPosts.filter((p) => !p.isDeleting)

  if (visiblePosts.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#111] flex items-center justify-center py-20">
        <p className="text-sm text-white/20">No posts found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/5 bg-[#111] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-white/1">
            <th className="text-left px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wide">
              Title
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wide hidden md:table-cell">
              Author
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wide">
              Status
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wide hidden lg:table-cell">
              Date
            </th>
            <th className="text-right px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {optimisticPosts.map((post) => {
            // If the parent context update has processed it out, don't execute structural row elements
            if (post.isDeleting && !isPending) return null

            return (
              <tr
                key={post.id}
                className={`hover:bg-white/1 transition-all duration-200 ${
                  post.isDeleting ? "opacity-30 pointer-events-none bg-red-500/2" : "opacity-100"
                }`}
              >
                {/* Title */}
                <td className="px-5 py-3.5 max-w-xs">
                  <p className="text-white/70 font-medium truncate text-sm">
                    {post.title}
                  </p>
                  <p className="text-white/25 text-xs truncate mt-0.5">
                    /blog/{post.slug}
                  </p>
                </td>

                {/* Author */}
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    {post.author.image ? (
                      <Image
                        src={post.author.image}
                        alt={post.author.name ?? "Author"}
                        width={20}
                        height={20}
                        className="rounded-full shrink-0 object-cover"
                        unoptimized={post.author.image.startsWith("http")} // Safe protection layer against unconfigured remote domains
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/40 shrink-0">
                        {post.author.name?.[0] ?? "A"}
                      </div>
                    )}
                    <span className="text-white/40 text-xs truncate">
                      {post.author.name}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <StatusBadge status={post.status} />
                </td>

                {/* Date */}
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  <span className="text-white/25 text-xs">
                    {post.publishedAt
                      ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
                      : "—"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/25 hover:text-white/60 hover:bg-white/5 border border-transparent transition-all"
                    >
                      <Pencil size={12} />
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDeleteClick(post.id)}
                      disabled={post.isDeleting}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                        confirmId === post.id
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : "text-white/25 hover:text-red-400 hover:bg-white/5 border-transparent"
                      }`}
                    >
                      {post.isDeleting ? (
                        <Loader2 size={12} className="animate-spin text-red-400" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      {confirmId === post.id ? "Confirm?" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────

export function PostTableSkeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-[#111] overflow-hidden animate-pulse">
      <div className="border-b border-white/5 px-5 py-3 flex gap-8 bg-white/1">
        {["w-12", "w-10", "w-10", "w-8", "w-12"].map((w, i) => (
          <div key={i} className={`h-3 ${w} rounded bg-white/5`} />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-white/5 flex items-center gap-8">
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 w-3/4 rounded bg-white/8" />
            <div className="h-2.5 w-1/3 rounded bg-white/5" />
          </div>
          <div className="h-3 w-20 rounded bg-white/5 hidden md:block" />
          <div className="h-5 w-16 rounded-md bg-white/5" />
          <div className="h-3 w-16 rounded bg-white/5 hidden lg:block" />
          <div className="flex gap-2 ml-auto">
            <div className="h-6 w-12 rounded-lg bg-white/5" />
            <div className="h-6 w-14 rounded-lg bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}
















// "use client"

// import { useState, useTransition, useOptimistic } from "react"
// import Image from "next/image"
// import Link from "next/link"
// import { formatDistanceToNow } from "date-fns"
// import { Pencil, Trash2, Loader2 } from "lucide-react"
// import { deletePost } from "@/services/post.service"
// import type { PostWithAuthor } from "@/types/post.types"
// import type { PostStatus } from "@prisma/client"

// // ─────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────

// interface PostTableProps {
//   posts: PostWithAuthor[]
// }

// interface StatusBadgeProps {
//   status: PostStatus
// }

// // ─────────────────────────────────────────
// // STATUS BADGE
// // ─────────────────────────────────────────

// function StatusBadge({ status }: StatusBadgeProps) {
//   const config: Record<PostStatus, { label: string; className: string }> = {
//     PUBLISHED: {
//       label:     "Published",
//       className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
//     },
//     DRAFT: {
//       label:     "Draft",
//       className: "bg-white/5 text-white/40 border-white/10",
//     },
//     ARCHIVED: {
//       label:     "Archived",
//       className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
//     },
//   }

//   const { label, className } = config[status]

//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${className}`}>
//       {label}
//     </span>
//   )
// }

// // ─────────────────────────────────────────
// // POST TABLE — Optimistic UI
// // ─────────────────────────────────────────

// export function PostTable({ posts }: PostTableProps) {
//   const [isPending, startTransition] = useTransition()

//   // ✅ Fix 2: useOptimistic — delete hote hi UI se hatao
//   const [optimisticPosts, removeOptimisticPost] = useOptimistic(
//     posts,
//     (currentPosts: PostWithAuthor[], deletedId: string) =>
//       currentPosts.filter((p) => p.id !== deletedId)
//   )

//   const [confirmId, setConfirmId]   = useState<string | null>(null)
//   const [deletingId, setDeletingId] = useState<string | null>(null)

//  function handleDeleteClick(postId: string) {
//   if (isPending) return        // ✅ Already processing — block karo
//   if (deletingId === postId) return  // ✅ Same post already deleting

//   if (confirmId !== postId) {
//     setConfirmId(postId)
//     setTimeout(() => setConfirmId(null), 3000)
//     return
//   }

//   setDeletingId(postId)
//   setConfirmId(null)

//   startTransition(async () => {
//     removeOptimisticPost(postId)

//     const result = await deletePost(postId)

//     if (!result.success) {
//       console.error("Delete failed:", result.error)
//     }

//     setDeletingId(null)
//   })
// }

//   if (optimisticPosts.length === 0) {
//     return (
//       <div className="rounded-xl border border-white/8 bg-[#111] flex items-center justify-center py-20">
//         <p className="text-sm text-white/20">No posts found.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="rounded-xl border border-white/8 bg-[#111] overflow-hidden">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="border-b border-white/8">
//             <th className="text-left px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wide">
//               Title
//             </th>
//             <th className="text-left px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wide hidden md:table-cell">
//               Author
//             </th>
//             <th className="text-left px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wide">
//               Status
//             </th>
//             <th className="text-left px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wide hidden lg:table-cell">
//               Date
//             </th>
//             <th className="text-right px-5 py-3 text-xs font-medium text-white/30 uppercase tracking-wide">
//               Actions
//             </th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-white/5">
//           {optimisticPosts.map((post) => (
//             <tr
//               key={post.id}
//               className={`hover:bg-white/2 transition-all ${
//                 deletingId === post.id ? "opacity-40 scale-95" : "opacity-100"
//               }`}
//             >
//               {/* Title */}
//               <td className="px-5 py-3.5 max-w-xs">
//                 <p className="text-white/70 font-medium truncate text-sm">
//                   {post.title}
//                 </p>
//                 <p className="text-white/25 text-xs truncate mt-0.5">
//                   /blog/{post.slug}
//                 </p>
//               </td>

//               {/* Author */}
//               <td className="px-5 py-3.5 hidden md:table-cell">
//                 <div className="flex items-center gap-2">
//                   {post.author.image ? (
//                     <Image
//                       src={post.author.image}
//                       alt={post.author.name ?? "Author"}
//                       width={20}
//                       height={20}
//                       className="rounded-full shrink-0"
//                     />
//                   ) : (
//                     <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/40 shrink-0">
//                       {post.author.name?.[0] ?? "A"}
//                     </div>
//                   )}
//                   <span className="text-white/40 text-xs truncate">
//                     {post.author.name}
//                   </span>
//                 </div>
//               </td>

//               {/* Status */}
//               <td className="px-5 py-3.5">
//                 <StatusBadge status={post.status} />
//               </td>

//               {/* Date */}
//               <td className="px-5 py-3.5 hidden lg:table-cell">
//                 <span className="text-white/25 text-xs">
//                   {post.publishedAt
//                     ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
//                     : "—"}
//                 </span>
//               </td>

//               {/* Actions */}
//               <td className="px-5 py-3.5">
//                 <div className="flex items-center justify-end gap-1">
//                   <Link
//                     href={`/admin/posts/${post.id}/edit`}
//                     className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/25 hover:text-white/60 hover:bg-white/5 border border-transparent transition-all"
//                   >
//                     <Pencil size={12} />
//                     Edit
//                   </Link>

//                   <button
//                     onClick={() => handleDeleteClick(post.id)}
//                     disabled={isPending && deletingId === post.id}
//                     className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
//                       confirmId === post.id
//                         ? "bg-red-500/15 text-red-400 border-red-500/30"
//                         : "text-white/25 hover:text-red-400 hover:bg-white/5 border-transparent"
//                     }`}
//                   >
//                     {deletingId === post.id ? (
//                       <Loader2 size={12} className="animate-spin" />
//                     ) : (
//                       <Trash2 size={12} />
//                     )}
//                     {confirmId === post.id ? "Confirm?" : "Delete"}
//                   </button>
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )
// }

// // ─────────────────────────────────────────
// // SKELETON
// // ─────────────────────────────────────────

// export function PostTableSkeleton() {
//   return (
//     <div className="rounded-xl border border-white/8 bg-[#111] overflow-hidden animate-pulse">
//       <div className="border-b border-white/8 px-5 py-3 flex gap-8">
//         {["w-12", "w-10", "w-10", "w-8", "w-12"].map((w, i) => (
//           <div key={i} className={`h-3 ${w} rounded bg-white/5`} />
//         ))}
//       </div>
//       {Array.from({ length: 5 }).map((_, i) => (
//         <div key={i} className="px-5 py-4 border-b border-white/5 flex items-center gap-8">
//           <div className="flex-1 flex flex-col gap-1.5">
//             <div className="h-3 w-3/4 rounded bg-white/8" />
//             <div className="h-2.5 w-1/3 rounded bg-white/5" />
//           </div>
//           <div className="h-3 w-20 rounded bg-white/5 hidden md:block" />
//           <div className="h-5 w-16 rounded-md bg-white/5" />
//           <div className="h-3 w-16 rounded bg-white/5 hidden lg:block" />
//           <div className="flex gap-2 ml-auto">
//             <div className="h-6 w-12 rounded-lg bg-white/5" />
//             <div className="h-6 w-14 rounded-lg bg-white/5" />
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }