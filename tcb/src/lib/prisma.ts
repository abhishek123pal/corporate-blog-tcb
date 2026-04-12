import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { withAccelerate } from "@prisma/extension-accelerate"

const createPrismaClient = () => {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  }).$extends(withAccelerate())
}

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export default prisma
// import { PrismaClient } from "@prisma/client"
// import { withAccelerate } from "@prisma/extension-accelerate"

// // ─────────────────────────────────────────
// // SINGLETON PATTERN
// // Next.js hot-reload mein har baar naya
// // instance nahi banega — globalThis check karta hai
// // ─────────────────────────────────────────

// const createPrismaClient = () =>
//   new PrismaClient({
//     log:
//       process.env.NODE_ENV === "development"
//         ? ["query", "error", "warn"]
//         : ["error"],
//   }).$extends(withAccelerate())

// type PrismaClientSingleton = ReturnType<typeof createPrismaClient>

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClientSingleton | undefined
// }

// const prisma = globalForPrisma.prisma ?? createPrismaClient()

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma
// }

// export default prisma