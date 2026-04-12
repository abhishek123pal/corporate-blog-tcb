import type { Metadata } from "next"
import { Geist } from "next/font/google"
import Providers from "@/components/layouts/Providers"
import Navbar from "@/components/layouts/Navbar"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: {
    default:  "The Corporate Blog — Insights That Matter",
    template: "%s | TCB",
  },
  description: "A high-performance publishing platform delivering expert insights on technology, development, and the modern web.",
  keywords:  ["blog", "technology", "nextjs", "typescript", "development"],
  authors:   [{ name: "TCB Team" }],
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://tcb.dev",
    siteName:    "The Corporate Blog",
    title:       "The Corporate Blog — Insights That Matter",
    description: "Expert insights on technology and modern web development.",
  },
  twitter: {
    card:  "summary_large_image",
    title: "The Corporate Blog",
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased bg-[#0a0a0a] text-[#e8e6e0]`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-white/10 py-12 mt-20">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-sm text-white/30 tracking-widest uppercase">
                The Corporate Blog
              </span>
              <span className="text-sm text-white/20">
                © {new Date().getFullYear()} TCB. All rights reserved.
              </span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}