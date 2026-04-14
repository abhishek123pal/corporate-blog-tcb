//@ts-nocheck
import { PrismaClient, PostStatus, Role } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { faker } from "@faker-js/faker"

const adapter = new PrismaNeon({
  connectionString: process.env.DIRECT_DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

const TAG_LIST = [
  { name: "Next.js",     slug: "nextjs"      },
  { name: "TypeScript",  slug: "typescript"  },
  { name: "React",       slug: "react"       },
  { name: "Prisma",      slug: "prisma"      },
  { name: "Database",    slug: "database"    },
  { name: "DevOps",      slug: "devops"      },
  { name: "CSS",         slug: "css"         },
  { name: "Performance", slug: "performance" },
]

async function main() {
  console.log("🌱 Seeding database...")

  await prisma.post.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  const tags = await Promise.all(
    TAG_LIST.map((tag) => prisma.tag.create({ data: tag }))
  )
  console.log(`✅ ${tags.length} tags created`)

  const admin = await prisma.user.create({
    data: {
      name:  "Abhishek Pal",
      email: "admin@tcb.dev",
      image: faker.image.avatar(),
      role:  Role.ADMIN,
    },
  })
  console.log(`✅ Admin created: ${admin.email}`)

  const authors = await Promise.all(
    Array.from({ length: 2 }, (_, i) =>
      prisma.user.create({
        data: {
          name:  faker.person.fullName(),
          email: `author${i + 1}@tcb.dev`,
          image: faker.image.avatar(),
          role:  Role.AUTHOR,
        },
      })
    )
  )
  console.log(`✅ ${authors.length} authors created`)

  const allUsers = [admin, ...authors]

  const postStatuses: PostStatus[] = [
    PostStatus.PUBLISHED,
    PostStatus.PUBLISHED,
    PostStatus.PUBLISHED,
    PostStatus.PUBLISHED,
    PostStatus.PUBLISHED,
    PostStatus.PUBLISHED,
    PostStatus.PUBLISHED,
    PostStatus.DRAFT,
    PostStatus.DRAFT,
    PostStatus.ARCHIVED,
  ]

  const posts = await Promise.all(
    postStatuses.map(async (status, i) => {
      const title  = faker.lorem.words({ min: 4, max: 8 })
      const slug   = `${generateSlug(title)}-${i}`
      const author = allUsers[i % allUsers.length]

      const randomTags = faker.helpers
        .shuffle(tags)
        .slice(0, faker.number.int({ min: 2, max: 3 }))

      return prisma.post.create({
        data: {
          title,
          slug,
          excerpt:     faker.lorem.sentences(2),
          content:     faker.lorem.paragraphs({ min: 4, max: 8 }, "\n\n"),
          coverImage:  faker.image.urlPicsumPhotos({ width: 1200, height: 630 }),
          status,
          viewCount:   faker.number.int({ min: 0, max: 50000 }),
          publishedAt: status === PostStatus.PUBLISHED
            ? faker.date.past({ years: 1 })
            : null,
          authorId: author.id,
          tags: {
            connect: randomTags.map((t) => ({ id: t.id })),
          },
        },
      })
    })
  )

  console.log(`✅ ${posts.length} posts created`)
  console.log(`   📝 Published : ${posts.filter(p => p.status === "PUBLISHED").length}`)
  console.log(`   📄 Draft     : ${posts.filter(p => p.status === "DRAFT").length}`)
  console.log(`   📦 Archived  : ${posts.filter(p => p.status === "ARCHIVED").length}`)
  console.log("\n🎉 Seed complete!")
  console.log("──────────────────────────────────")
  console.log("Admin  → admin@tcb.dev")
  console.log("Author → author1@tcb.dev")
  console.log("Author → author2@tcb.dev")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })