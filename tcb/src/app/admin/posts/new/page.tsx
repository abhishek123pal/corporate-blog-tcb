import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PostForm } from "@/components/admin/PostForm"
import prisma from "@/lib/prisma"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "New Post",
}

export default async function NewPostPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-medium text-white/80">New Post</h1>
        <p className="text-sm text-white/30 mt-0.5">
          Create and publish a new article.
        </p>
      </div>
      <PostForm
        authorId={session.user.id}
        tags={tags}
      />
    </div>
  )
}