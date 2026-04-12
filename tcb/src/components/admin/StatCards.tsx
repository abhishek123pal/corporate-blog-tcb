import prisma from "@/lib/prisma"
import { FileText, Eye, FilePen, CheckCircle } from "lucide-react"
import type { PostStatus } from "@prisma/client"

interface StatCardProps {
  label:     string
  value:     string | number
  icon:      React.ReactNode
  iconColor: string
}

function StatCard({ label, value, icon, iconColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#111] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30 font-medium tracking-wide uppercase">
          {label}
        </span>
        <div className={`${iconColor} p-1.5 rounded-lg bg-white/5`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-medium text-white/80">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

export async function StatCards() {
  const [total, published, drafts, archived, views] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" as PostStatus } }),
    prisma.post.count({ where: { status: "DRAFT"      as PostStatus } }),
    prisma.post.count({ where: { status: "ARCHIVED"   as PostStatus } }),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
  ])

  const stats: StatCardProps[] = [
    {
      label:     "Total Posts",
      value:     total,
      icon:      <FileText size={14} />,
      iconColor: "text-blue-400",
    },
    {
      label:     "Total Views",
      value:     views._sum.viewCount ?? 0,
      icon:      <Eye size={14} />,
      iconColor: "text-purple-400",
    },
    {
      label:     "Drafts",
      value:     drafts,
      icon:      <FilePen size={14} />,
      iconColor: "text-amber-400",
    },
    {
      label:     "Published",
      value:     published,
      icon:      <CheckCircle size={14} />,
      iconColor: "text-emerald-400",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/8 bg-[#111] p-5 flex flex-col gap-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-white/5" />
            <div className="h-7 w-7 rounded-lg bg-white/5" />
          </div>
          <div className="h-7 w-16 rounded bg-white/8" />
        </div>
      ))}
    </div>
  )
}
