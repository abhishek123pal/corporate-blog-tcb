import { algoliasearch } from "algoliasearch"
import type { PostWithAuthorAndCategory } from "@/types/post.types"
import type { AlgoliaPostRecord }         from "@/types/post.types"

// ─────────────────────────────────────────
// ALGOLIA CLIENT
// ─────────────────────────────────────────

export const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!,
)

export const ALGOLIA_INDEX = "tcb_posts"

// ─────────────────────────────────────────
// SYNC HELPER
// PostWithAuthorAndCategory → AlgoliaPostRecord
// Post publish/update hone par call hoga
// ─────────────────────────────────────────

export function mapPostToAlgoliaRecord(
  post: PostWithAuthorAndCategory
): AlgoliaPostRecord {
  return {
    objectID:    post.id,
    title:       post.title,
    slug:        post.slug,
    excerpt:     post.excerpt ?? "",
    authorName:  post.author.name ?? "Anonymous",
    tags:        post.tags.map((t) => t.name),
    publishedAt: post.publishedAt
      ? new Date(post.publishedAt).getTime()
      : Date.now(),
    viewCount:   post.viewCount,
  }
}

export async function syncPostToAlgolia(
  post: PostWithAuthorAndCategory
): Promise<void> {
  try {
    const record = mapPostToAlgoliaRecord(post)
    await algoliaClient.saveObject({
      indexName: ALGOLIA_INDEX,
      body:      record,
    })
  } catch (error) {
    console.error("[Algolia] Sync failed:", error)
    // Search fail hone par post save block nahi hona chahiye
  }
}

export async function deletePostFromAlgolia(postId: string): Promise<void> {
  try {
    await algoliaClient.deleteObject({
      indexName: ALGOLIA_INDEX,
      objectID:  postId,
    })
  } catch (error) {
    console.error("[Algolia] Delete failed:", error)
  }
}