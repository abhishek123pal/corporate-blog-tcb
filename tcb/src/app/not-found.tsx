import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 — Page Not Found",
}

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">

        {/* 404 number */}
        <p className="text-[120px] font-medium leading-none text-white/4 select-none mb-2">
          404
        </p>

        {/* Divider */}
        <div className="w-12 h-px bg-white/10 mx-auto mb-8" />

        {/* Message */}
        <h1 className="text-xl font-medium text-white/70 mb-3">
          Page not found
        </h1>
        <p className="text-sm text-white/30 leading-relaxed mb-10">
          The page you are looking for does not exist, has been moved,
          or is temporarily unavailable.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-white/8 border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/12 transition-all"
          >
            Go home
          </Link>
          <Link
            href="/blog"
            className="px-5 py-2.5 rounded-lg border border-white/8 text-sm text-white/35 hover:text-white/60 hover:bg-white/5 transition-all"
          >
            Browse articles
          </Link>
        </div>

      </div>
    </div>
  )
}