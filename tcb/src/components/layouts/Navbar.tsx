// src/components/layouts/Navbar.tsx
"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { PenLine, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl bg-[#0a0a0a]/80">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-medium tracking-widest uppercase text-white/80 hover:text-white transition-colors"
        >
          TCB
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: "/",         label: "Home"     },
            { href: "/blog",     label: "Articles" },
            { href: "/about", label: "About"   },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/50 hover:text-white/90 transition-colors tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right — Auth */}
        <div className="flex items-center gap-3">
          {status === "loading" && (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          )}

          {status === "unauthenticated" && (
            <button
              onClick={() => signIn()}
              className="text-sm px-4 py-1.5 rounded-full border border-white/20 text-white/70 hover:border-white/40 hover:text-white transition-all"
            >
              Login
            </button>
          )}

          {status === "authenticated" && session && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30 transition-all"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                    {session.user?.name?.[0] ?? "U"}
                  </div>
                )}
                <span className="text-sm text-white/70 hidden md:block">
                  {session.user?.name?.split(" ")[0]}
                </span>
                <ChevronDown size={14} className="text-white/40" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#141414] shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white/80">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-white/30 truncate">
                      {session.user?.email}
                    </p>
                  </div>

                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard size={14} />
                      Admin Panel
                    </Link>
                  )}

                  <Link
                    href="/admin/posts/new"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <PenLine size={14} />
                    New Post
                  </Link>

                  <button
                    onClick={() => { signOut(); setDropdownOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-white/5 transition-colors border-t border-white/10"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}