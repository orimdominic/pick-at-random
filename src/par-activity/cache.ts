import { createNodeRedisClient } from "handy-redis";
import { createClient } from "redis-mock";
console.log(process.env.NODE_ENV);

const cache =
  process.env.NODE_ENV === "production"
    ? createClient()
    : createNodeRedisClient({
        url: process.env.REDIS_URL,
      });

export { cache };
