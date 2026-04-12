import { Redis } from "@upstash/redis"
import { config } from "dotenv"

config({ path: ".env" })

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

await redis.flushall()
console.log("Cache cleared!")
process.exit(0)