import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-medium text-white/10 mb-4">403</p>
        <h1 className="text-xl font-medium text-white/70 mb-3">
          Access Denied
        </h1>
        <p className="text-sm text-white/30 mb-8">
          You don't have permission to access this page.
        </p>
        <Link
          href="/"
          className="text-sm px-6 py-2.5 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}