import { Prisma } from "@prisma/client"
import type { PostStatus } from "@prisma/client"

const postWithAuthorValidator = Prisma.validator<Prisma.PostDefaultArgs>()({
  include: {
    author: {
      select: { id: true, name: true, image: true, role: true },
    },
  },
})

const postWithCategoryValidator = Prisma.validator<Prisma.PostDefaultArgs>()({
  include: {
    tags: {
      select: { id: true, name: true, slug: true },
    },
  },
})

const postWithAuthorAndCategoryValidator =
  Prisma.validator<Prisma.PostDefaultArgs>()({
    include: {
      author: {
        select: { id: true, name: true, image: true, role: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
      },
    },
  })

export type PostWithAuthor =
  Prisma.PostGetPayload<typeof postWithAuthorValidator>

export type PostWithCategory =
  Prisma.PostGetPayload<typeof postWithCategoryValidator>

export type PostWithAuthorAndCategory =
  Prisma.PostGetPayload<typeof postWithAuthorAndCategoryValidator>

// ─────────────────────────────────────────
// SERVER ACTION INPUT TYPES
// ─────────────────────────────────────────

export type CreatePostInput = {
  title:        string
  slug:         string
  excerpt?:     string
  content:      string
  coverImage?:  string
  status:       PostStatus   // ✅ status add kiya
  tagIds:       string[]
}

export type UpdatePostInput = Partial<CreatePostInput> & {
  id: string
}

// ─────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────

export type PaginatedPosts = {
  posts:       PostWithAuthor[]
  total:       number
  page:        number
  pageSize:    number
  hasNextPage: boolean
}

// ─────────────────────────────────────────
// ALGOLIA RECORD TYPE
// ─────────────────────────────────────────

export type AlgoliaPostRecord = {
  objectID:    string
  title:       string
  slug:        string
  excerpt:     string
  authorName:  string
  tags:        string[]
  publishedAt: number
  viewCount:   number
}



















// import { Prisma } from "@prisma/client";

// // ─────────────────────────────────────────
// // PRISMA VALIDATORS
// // ─────────────────────────────────────────

// const postWithAuthorValidator = Prisma.validator<Prisma.PostDefaultArgs>()({
//   include: {
//     author: {
//       select: {
//         id:    true,
//         name:  true,
//         image: true,
//         role:  true,
//       },
//     },
//   },
// });

// const postWithCategoryValidator = Prisma.validator<Prisma.PostDefaultArgs>()({
//   include: {
//     tags: {
//       select: {
//         id:   true,
//         name: true,
//         slug: true,
//       },
//     },
//   },
// });

// const postWithAuthorAndCategoryValidator =
//   Prisma.validator<Prisma.PostDefaultArgs>()({
//     include: {
//       author: {
//         select: {
//           id:    true,
//           name:  true,
//           image: true,
//           role:  true,
//         },
//       },
//       tags: {
//         select: {
//           id:   true,
//           name: true,
//           slug: true,
//         },
//       },
//     },
//   });

// // ─────────────────────────────────────────
// // EXPORTED TYPES
// // ─────────────────────────────────────────

// export type PostWithAuthor =
//   Prisma.PostGetPayload<typeof postWithAuthorValidator>;

// export type PostWithCategory =
//   Prisma.PostGetPayload<typeof postWithCategoryValidator>;

// export type PostWithAuthorAndCategory =
//   Prisma.PostGetPayload<typeof postWithAuthorAndCategoryValidator>;

// // ─────────────────────────────────────────
// // SERVER ACTION INPUT TYPES
// // ─────────────────────────────────────────

// export type CreatePostInput = {
//   title:       string;
//   slug:        string;
//   excerpt?:    string;
//   content:     string;
//   coverImage?: string;
//   tagIds:      string[];
// };

// export type UpdatePostInput = Partial<CreatePostInput> & {
//   id: string;
// };

// // ─────────────────────────────────────────
// // PAGINATION
// // ─────────────────────────────────────────

// export type PaginatedPosts = {
//   posts:       PostWithAuthor[];
//   total:       number;
//   page:        number;
//   pageSize:    number;
//   hasNextPage: boolean;
// };

// // ─────────────────────────────────────────
// // ALGOLIA RECORD TYPE
// // ─────────────────────────────────────────

// export type AlgoliaPostRecord = {
//   objectID:    string;
//   title:       string;
//   slug:        string;
//   excerpt:     string;
//   authorName:  string;
//   tags:        string[];
//   publishedAt: number;
//   viewCount:   number;
// };