"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"

interface Tag {
  id:   string
  name: string
  slug: string
}

interface FilterBarProps {
  tags:          Tag[]
  activeTag?:    string
  activeSearch?: string
}

export function FilterBar({ tags, activeTag, activeSearch }: FilterBarProps) {
  const router     = useRouter()
  const pathname   = usePathname()
  const params     = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const searchRef  = useRef<HTMLInputElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    })

    next.delete("page") // Filter change hone par page 1 se shuru

    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`)
    })
  }

  function handleSearch(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updateParams({ search: value || null })
    }, 400)
  }

  function clearAll() {
    if (searchRef.current) searchRef.current.value = ""
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasFilters = activeTag || activeSearch

  return (
    <div className="flex flex-col gap-4">

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
        />
        {isPending ? (
          <Loader2
            size={14}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 animate-spin"
          />
        ) : activeSearch ? (
          <button
            onClick={() => {
              if (searchRef.current) searchRef.current.value = ""
              updateParams({ search: null })
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
          >
            <X size={14} />
          </button>
        ) : null}
        <input
          ref={searchRef}
          type="text"
          defaultValue={activeSearch ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-white/3 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-medium text-white/25 uppercase tracking-widest px-1">
          Topics
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => updateParams({ tag: null })}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
              !activeTag
                ? "bg-white/10 border-white/20 text-white/70"
                : "border-white/8 text-white/30 hover:border-white/15 hover:text-white/50"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => updateParams({ tag: tag.slug === activeTag ? null : tag.slug })}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeTag === tag.slug
                  ? "bg-white/10 border-white/20 text-white/70"
                  : "border-white/8 text-white/30 hover:border-white/15 hover:text-white/50"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors self-start"
        >
          <X size={11} />
          Clear filters
        </button>
      )}

    </div>
  )
}