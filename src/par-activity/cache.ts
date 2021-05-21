import { createNodeRedisClient } from "handy-redis";
import { createClient } from "redis-mock";

const cache =
  process.env.NODE_ENV === "production"
    ? createNodeRedisClient({
        url: process.env.REDIS_URL,
      })
    : createClient();

export { cache };
