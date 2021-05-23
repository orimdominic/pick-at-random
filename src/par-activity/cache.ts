import { createNodeRedisClient } from "handy-redis";
import { createClient } from "redis-mock";

console.log("cache env:", process.env.NODE_ENV);

const cache =
  process.env.NODE_ENV === "production"
    ? createNodeRedisClient({
      url: process.env.REDIS_URL,
    })
    : createClient()

export { cache };
