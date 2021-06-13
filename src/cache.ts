/* eslint @typescript-eslint/no-var-requires: "off" */

import { createNodeRedisClient, WrappedNodeRedisClient } from "handy-redis";

let cache: WrappedNodeRedisClient;

switch (process.env.NODE_ENV) {
  case "production":
    cache = createNodeRedisClient({
      url: process.env.REDIS_URL,
    });
    break;
  case "development":
    cache = createNodeRedisClient({
      host: "localhost",
      port: 6379,
    });
    break;
  default:
    cache = require("redis-mock").createClient();
    break;
}

export { cache, WrappedNodeRedisClient };
