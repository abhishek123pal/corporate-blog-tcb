"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  total:    number
  page:     number
  pageSize: number
}

export function Pagination({ total, page, pageSize }: PaginationProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  function goToPage(p: number) {
    const next = new URLSearchParams(params.toString())
    next.set("page", p.toString())
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`)
    })
  }

  // Page numbers generate karo
  function getPages(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages]
    }

    if (page >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages]
  }

  return (
    <div className={`flex items-center justify-center gap-1 transition-opacity ${isPending ? "opacity-50" : ""}`}>

      {/* Prev */}
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page === 1 || isPending}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 border border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={14} />
        Prev
      </button>

      {/* Pages */}
      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-white/20 text-xs">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goToPage(p as number)}
            disabled={isPending}
            className={`w-8 h-8 rounded-lg text-xs transition-all border ${
              page === p
                ? "bg-white/10 border-white/20 text-white/70"
                : "border-transparent text-white/30 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goToPage(page + 1)}
        disabled={page === totalPages || isPending}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 border border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next
        <ChevronRight size={14} />
      </button>

    </div>
  )
}