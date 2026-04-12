import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
} from "lucide-react"
import { signOut } from "@/lib/auth"

interface AdminLayoutProps {
  children: React.ReactNode
}

const NAV_ITEMS = [
  { href: "/admin",       icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/posts", icon: FileText,         label: "Posts"     },
  { href: "/admin/settings", icon: Settings,      label: "Settings"  },
]

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/unauthorized")

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/8 bg-[#0d0d0d]">

        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-white/8">
          <span className="text-xs font-medium tracking-widest uppercase text-white/40">
            TCB Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors group"
            >
              <Icon size={15} className="shrink-0 group-hover:text-white/60 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + Signout */}
        <div className="p-3 border-t border-white/8">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={24}
                height={24}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/50 shrink-0">
                {session.user.name?.[0] ?? "U"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/60 truncate">
                {session.user.name}
              </p>
              <p className="text-[10px] text-white/25 truncate">
                {session.user.email}
              </p>
            </div>
          </div>

          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-red-400/70 hover:bg-white/5 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-8 border-b border-white/8 shrink-0">
          <h1 className="text-sm font-medium text-white/60">
            Admin Panel
          </h1>
          <span className="text-xs text-white/25">
            {session.user.email}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}