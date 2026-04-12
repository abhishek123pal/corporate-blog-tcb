// import path from "path"
// import { defineConfig } from "prisma/config"

// export default defineConfig({
//   schema: path.join("prisma", "schema.prisma"),
//   datasource: {
//     url: process.env.DIRECT_DATABASE_URL!,
//   },
// })
import path from "path"
import { defineConfig } from "prisma/config"
import * as dotenv from "dotenv"

// Ye line .env file ko manually load karegi
dotenv.config()

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    // Fallback logic rakho: agar direct na mile toh normal wala uthao
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
  },
})