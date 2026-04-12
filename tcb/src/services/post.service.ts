// "use server"

// import { type PostStatus, type Prisma } from "@prisma/client"
// import prisma from "@/lib/prisma"
// import { getCache, setCache, invalidateCache, CacheKeys } from "@/lib/redis"
// import {redis} from "@/lib/redis" // ✅ Added this for the .keys() call in createPost
// import { syncPostToAlgolia, deletePostFromAlgolia } from "@/lib/algolia"
// import { revalidatePath } from "next/cache"
// import type { CreatePostInput, UpdatePostInput, PaginatedPosts, PostWithAuthorAndCategory } from "@/types/post.types"
// import type { ApiResponse } from "@/types/api.types"

// export async function getPostBySlug(
//   slug: string
// ): Promise<ApiResponse<PostWithAuthorAndCategory>> {
//   try {
//     const cached = await getCache<PostWithAuthorAndCategory>(CacheKeys.post(slug))
//     if (cached) return { success: true, data: cached }

//     const post = await prisma.post.findUnique({
//       where:    { slug, status: "PUBLISHED" },
//       include: {
//         author: { select: { id: true, name: true, image: true, role: true } },
//         tags:    { select: { id: true, name: true, slug: true } },
//       },
//     })

//     if (!post) return { success: false, error: "Post not found", code: "NOT_FOUND" }

//     await setCache(CacheKeys.post(slug), post, 3600)
//     return { success: true, data: post as PostWithAuthorAndCategory }
//   } catch {
//     return { success: false, error: "Failed to fetch post", code: "SERVER_ERROR" }
//   }
// }

// export async function getPosts(
//   page:      number     = 1,
//   pageSize:  number     = 9,
//   tag?:      string,
//   status?:   PostStatus,
//   search?:   string,
// ): Promise<ApiResponse<PaginatedPosts>> {
//   try {
//     const where: Prisma.PostWhereInput = {
//       ...(status ? { status } : { status: "PUBLISHED" as PostStatus }),
//       ...(tag    && { tags: { some: { slug: tag } } }),
//       ...(search && {
//         OR: [
//           { title:   { contains: search, mode: "insensitive" } },
//           { excerpt: { contains: search, mode: "insensitive" } },
//         ],
//       }),
//     }

//     const cacheKey = "tcb:posts:" + page + ":" + (tag ?? "") + ":" + (search ?? "") + ":" + (status ?? "")

//     if (!status && !search) {
//       const cached = await getCache<PaginatedPosts>(cacheKey)
//       if (cached) return { success: true, data: cached }
//     }

//     const [posts, total] = await Promise.all([
//       prisma.post.findMany({
//         where,
//         include: {
//           author: { select: { id: true, name: true, image: true, role: true } },
//           tags:    { select: { id: true, name: true, slug: true } },
//         },
//         orderBy: { publishedAt: "desc" },
//         skip:    (page - 1) * pageSize,
//         take:    pageSize,
//       }),
//       prisma.post.count({ where }),
//     ])

//     const result: PaginatedPosts = {
//       posts:       posts as any,
//       total,
//       page,
//       pageSize,
//       hasNextPage: page * pageSize < total,
//     }

//     if (!status && !search) await setCache(cacheKey, result, 900)

//     return { success: true, data: result }
//   } catch {
//     return { success: false, error: "Failed to fetch posts", code: "SERVER_ERROR" }
//   }
// }

// export async function getTrendingPosts(
//   limit: number = 5
// ): Promise<ApiResponse<PostWithAuthorAndCategory[]>> {
//   try {
//     const cached = await getCache<PostWithAuthorAndCategory[]>(CacheKeys.trendingPosts())
//     if (cached) return { success: true, data: cached }

//     const posts = await prisma.post.findMany({
//       where:    { status: "PUBLISHED" },
//       include: {
//         author: { select: { id: true, name: true, image: true, role: true } },
//         tags:    { select: { id: true, name: true, slug: true } },
//       },
//       orderBy: { viewCount: "desc" },
//       take:    limit,
//     })

//     await setCache(CacheKeys.trendingPosts(), posts, 1800)
//     return { success: true, data: posts as any }
//   } catch {
//     return { success: false, error: "Failed to fetch trending posts", code: "SERVER_ERROR" }
//   } // ✅ Fixed: Added closing brace for catch
// } // ✅ Fixed: Added closing brace for function

// export async function createPost(
//   input:    CreatePostInput,
//   authorId: string,
// ): Promise<ApiResponse<PostWithAuthorAndCategory>> {
//   try {
//     const post = await prisma.post.create({
//       data: {
//         title:       input.title,
//         slug:        input.slug,
//         excerpt:     input.excerpt,
//         content:     input.content,
//         coverImage:  input.coverImage,
//         status:      input.status,
//         authorId,
//         publishedAt: input.status === "PUBLISHED" ? new Date() : null,
//         tags: {
//           connect: input.tagIds.map((id) => ({ id })),
//         },
//       },
//       include: {
//         author: { select: { id: true, name: true, image: true, role: true } },
//         tags:    { select: { id: true, name: true, slug: true } },
//       },
//     })

//     try {
//       const keys = await redis.keys("tcb:posts:*")
//       if (keys.length > 0) await redis.del(...keys)
//     } catch {
//       // Silent fail
//     }

//     if (post.status === "PUBLISHED") {
//       void syncPostToAlgolia(post as any)
//     }

//     revalidatePath("/")
//     revalidatePath("/blog")
//     revalidatePath("/admin")
//     revalidatePath("/admin/posts")

//     return { success: true, data: post as any }
//   } catch (error) {
//     console.error("[createPost]", error)
//     return { success: false, error: "Failed to create post", code: "SERVER_ERROR" }
//   }
// }

// export async function updatePost(
//   input: UpdatePostInput
// ): Promise<ApiResponse<PostWithAuthorAndCategory>> {
//   try {
//     const { id, tagIds, ...rest } = input

//     const post = await prisma.post.update({
//       where: { id },
//       data:  {
//         ...rest,
//         publishedAt: rest.status === "PUBLISHED" ? new Date() : undefined,
//         ...(tagIds && {
//           tags: {
//             set:     [],
//             connect: tagIds.map((tid) => ({ id: tid })),
//           },
//         }),
//       },
//       include: {
//         author: { select: { id: true, name: true, image: true, role: true } },
//         tags:    { select: { id: true, name: true, slug: true } },
//       },
//     })

//     void invalidateCache(CacheKeys.post(post.slug))
//     void invalidateCache(CacheKeys.posts(1))

//     if (post.status === "PUBLISHED") void syncPostToAlgolia(post as any)

//     revalidatePath("/blog/" + post.slug)
//     revalidatePath("/")
//     revalidatePath("/admin")

//     return { success: true, data: post as any }
//   } catch (error) {
//     console.error("[updatePost]", error)
//     return { success: false, error: "Failed to update post", code: "SERVER_ERROR" }
//   }
// }

// export async function deletePost(
//   id: string
// ): Promise<ApiResponse<{ id: string }>> {
//   try {
//     const post = await prisma.post.delete({
//       where: { id },
//     })

//     void invalidateCache(CacheKeys.post(post.slug))
//     void invalidateCache(CacheKeys.posts(1))
//     void invalidateCache(CacheKeys.trendingPosts())
//     void deletePostFromAlgolia(post.id)

//     revalidatePath("/")
//     revalidatePath("/admin")
//     revalidatePath("/admin/posts")

//     return { success: true, data: { id: post.id } }
//   } catch (error) {
//     const message = error instanceof Error ? error.message : String(error)
//     console.error("[deletePost]", message)
//     return { success: false, error: message, code: "SERVER_ERROR" }
//   }
// }

// export async function incrementViewCount(id: string): Promise<void> {
//   try {
//     await prisma.post.update({
//       where: { id },
//       data:  { viewCount: { increment: 1 } },
//     })
//   } catch {
//     // Silent fail
//   }
// }/
"use server"

import { type PostStatus, type Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"
import { redis, getCache, setCache, invalidateCache, CacheKeys } from "@/lib/redis"
import { syncPostToAlgolia, deletePostFromAlgolia } from "@/lib/algolia"
import { revalidatePath } from "next/cache"
import type { CreatePostInput, UpdatePostInput, PaginatedPosts, PostWithAuthorAndCategory } from "@/types/post.types"
import type { ApiResponse } from "@/types/api.types"

async function clearAllPostCaches() {
  try {
    const keys = await redis.keys("tcb:posts:*")
    if (keys.length > 0) await redis.del(...keys)
  } catch {
    // Silent fail
  }
}

export async function getPostBySlug(
  slug: string
): Promise<ApiResponse<PostWithAuthorAndCategory>> {
  try {
    const cached = await getCache<PostWithAuthorAndCategory>(CacheKeys.post(slug))
    if (cached) return { success: true, data: cached }

    const post = await prisma.post.findUnique({
      where:   { slug, status: "PUBLISHED" },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        tags:   { select: { id: true, name: true, slug: true } },
      },
    })

    if (!post) return { success: false, error: "Post not found", code: "NOT_FOUND" }

    await setCache(CacheKeys.post(slug), post, 3600)
    return { success: true, data: post as PostWithAuthorAndCategory }
  } catch {
    return { success: false, error: "Failed to fetch post", code: "SERVER_ERROR" }
  }
}

export async function getPosts(
  page:     number    = 1,
  pageSize: number    = 9,
  tag?:     string,
  status?:  PostStatus,
  search?:  string,
): Promise<ApiResponse<PaginatedPosts>> {
  try {
    const where: Prisma.PostWhereInput = {
      ...(status ? { status } : { status: "PUBLISHED" as PostStatus }),
      ...(tag    && { tags: { some: { slug: tag } } }),
      ...(search && {
        OR: [
          { title:   { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    const cacheKey = "tcb:posts:" + page + ":" + (tag ?? "") + ":" + (search ?? "") + ":" + (status ?? "")

    if (!status && !search) {
      const cached = await getCache<PaginatedPosts>(cacheKey)
      if (cached) return { success: true, data: cached }
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true, role: true } },
          tags:   { select: { id: true, name: true, slug: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip:    (page - 1) * pageSize,
        take:    pageSize,
      }),
      prisma.post.count({ where }),
    ])

    const result: PaginatedPosts = {
      posts:       posts as any,
      total,
      page,
      pageSize,
      hasNextPage: page * pageSize < total,
    }

    if (!status && !search) await setCache(cacheKey, result, 900)

    return { success: true, data: result }
  } catch {
    return { success: false, error: "Failed to fetch posts", code: "SERVER_ERROR" }
  }
}

export async function getTrendingPosts(
  limit: number = 5
): Promise<ApiResponse<PostWithAuthorAndCategory[]>> {
  try {
    const cached = await getCache<PostWithAuthorAndCategory[]>(CacheKeys.trendingPosts())
    if (cached) return { success: true, data: cached }

    const posts = await prisma.post.findMany({
      where:   { status: "PUBLISHED" },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        tags:   { select: { id: true, name: true, slug: true } },
      },
      orderBy: { viewCount: "desc" },
      take:    limit,
    })

    await setCache(CacheKeys.trendingPosts(), posts, 1800)
    return { success: true, data: posts as any }
  } catch {
    return { success: false, error: "Failed to fetch trending posts", code: "SERVER_ERROR" }
  }
}

export async function createPost(
  input:    CreatePostInput,
  authorId: string,
): Promise<ApiResponse<PostWithAuthorAndCategory>> {
  try {
    const post = await prisma.post.create({
      data: {
        title:       input.title,
        slug:        input.slug,
        excerpt:     input.excerpt,
        content:     input.content,
        coverImage:  input.coverImage,
        status:      input.status,
        authorId,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        tags: { connect: input.tagIds.map((id) => ({ id })) },
      },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        tags:   { select: { id: true, name: true, slug: true } },
      },
    })

    await clearAllPostCaches()

    if (post.status === "PUBLISHED") void syncPostToAlgolia(post as any)

    revalidatePath("/")
    revalidatePath("/blog")
    revalidatePath("/admin")
    revalidatePath("/admin/posts")

    return { success: true, data: post as any }
  } catch (error) {
    console.error("[createPost]", error)
    return { success: false, error: "Failed to create post", code: "SERVER_ERROR" }
  }
}

export async function updatePost(
  input: UpdatePostInput
): Promise<ApiResponse<PostWithAuthorAndCategory>> {
  try {
    const { id, tagIds, ...rest } = input

    const post = await prisma.post.update({
      where: { id },
      data:  {
        ...rest,
        publishedAt: rest.status === "PUBLISHED" ? new Date() : undefined,
        ...(tagIds && {
          tags: { set: [], connect: tagIds.map((tid) => ({ id: tid })) },
        }),
      },
      include: {
        author: { select: { id: true, name: true, image: true, role: true } },
        tags:   { select: { id: true, name: true, slug: true } },
      },
    })

    await clearAllPostCaches()
    void invalidateCache(CacheKeys.post(post.slug))

    if (post.status === "PUBLISHED") void syncPostToAlgolia(post as any)

    revalidatePath("/blog/" + post.slug)
    revalidatePath("/")
    revalidatePath("/blog")
    revalidatePath("/admin")
    revalidatePath("/admin/posts")

    return { success: true, data: post as any }
  } catch (error) {
    console.error("[updatePost]", error)
    return { success: false, error: "Failed to update post", code: "SERVER_ERROR" }
  }
}

export async function deletePost(
  id: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    // ✅ deleteMany — record na mile to error nahi
    const result = await prisma.post.deleteMany({
      where: { id },
    })

    if (result.count === 0) {
      return { success: true, data: { id } }
    }

    await clearAllPostCaches()
    void deletePostFromAlgolia(id)

    revalidatePath("/")
    revalidatePath("/blog")
    revalidatePath("/admin")
    revalidatePath("/admin/posts")

    return { success: true, data: { id } }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[deletePost]", message)
    return { success: false, error: message, code: "SERVER_ERROR" }
  }
}

export async function incrementViewCount(id: string): Promise<void> {
  try {
    await prisma.post.update({
      where: { id },
      data:  { viewCount: { increment: 1 } },
    })
  } catch {
    // Silent fail
  }
}