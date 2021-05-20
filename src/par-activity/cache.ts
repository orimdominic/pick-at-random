import { createNodeRedisClient } from "handy-redis";

const cache =
  process.env.NODE_ENV === "production"
    ? createNodeRedisClient({
        url: process.env.REDIS_URL,
      })
    : createNodeRedisClient({ host: "127.0.0.1", port: 6379 });

export { cache };
