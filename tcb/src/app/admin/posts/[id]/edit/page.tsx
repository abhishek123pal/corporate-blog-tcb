import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { PostForm } from "@/components/admin/PostForm"
import prisma from "@/lib/prisma"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Edit Post" }

type Props = { params: Promise<{ id: string }> }

export default async function EditPostPage({ params }: Props) {
  const { id }  = await params
  const session = await auth()

  if (!session?.user?.id) redirect("/login")

  const [post, tags] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        tags:   { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!post) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-medium text-white/80">Edit Post</h1>
        <p className="text-sm text-white/30 mt-0.5 truncate">
          {post.title}
        </p>
      </div>
      <PostForm
        authorId={session.user.id}
        tags={tags}
        post={post as any}
      />
    </div>
  )
}
