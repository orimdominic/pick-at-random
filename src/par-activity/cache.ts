import { createNodeRedisClient } from "handy-redis";

const cache = createNodeRedisClient({
  url: process.env.REDIS_URL,
});

export { cache };
