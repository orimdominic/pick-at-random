import { createNodeRedisClient } from "handy-redis";

let cache: any;
if (process.env.NODE_ENV === "production") {
  cache = createNodeRedisClient({
    url: process.env.REDIS_URL,
  });
} else {
  const { createClient } = require("redis-mock");
  cache = createClient();
}

export { cache };
