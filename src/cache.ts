/* eslint @typescript-eslint/no-var-requires: "off" */

import { createNodeRedisClient, WrappedNodeRedisClient } from "handy-redis";

let cache: WrappedNodeRedisClient;
let createClient;

switch (process.env.NODE_ENV) {
  case "production":
    cache = createNodeRedisClient({
      url: process.env.REDIS_URL,
    });
    break;
  case "local":
    cache = createNodeRedisClient();
    break;
  default:
    createClient = require("redis-mock").createClient;
    cache = createClient();
    break;
}

export { cache };
