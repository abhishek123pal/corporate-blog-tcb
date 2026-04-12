"use server"

import { algoliaClient, ALGOLIA_INDEX, mapPostToAlgoliaRecord } from "@/lib/algolia"
import prisma from "@/lib/prisma"
import type { PostWithAuthorAndCategory } from "@/types/post.types"
import type { ApiResponse } from "@/types/api.types"

export async function indexPost(
  post: PostWithAuthorAndCategory
): Promise<ApiResponse<{ objectID: string }>> {
  try {
    const record = mapPostToAlgoliaRecord(post)
    await algoliaClient.saveObject({ indexName: ALGOLIA_INDEX, body: record })
    return { success: true, data: { objectID: record.objectID } }
  } catch {
    return { success: false, error: "Failed to index post", code: "SERVER_ERROR" }
  }
}

export async function deletePostFromSearch(
  postId: string
): Promise<ApiResponse<{ objectID: string }>> {
  try {
    await algoliaClient.deleteObject({ indexName: ALGOLIA_INDEX, objectID: postId })
    return { success: true, data: { objectID: postId } }
  } catch {
    return { success: false, error: "Failed to delete from search", code: "SERVER_ERROR" }
  }
}

export async function syncAllPostsToAlgolia(): Promise<ApiResponse<{ synced: number }>> {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        tags:   { select: { id: true, name: true, slug: true } },
      },
    })
    const records = posts.map((post) =>
      mapPostToAlgoliaRecord(post as PostWithAuthorAndCategory)
    )
    await algoliaClient.saveObjects({ indexName: ALGOLIA_INDEX, objects: records })
    return { success: true, data: { synced: records.length } }
  } catch {
    return { success: false, error: "Failed to sync posts", code: "SERVER_ERROR" }
  }
}