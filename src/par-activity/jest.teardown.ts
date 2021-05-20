import { cache } from "./cache";

module.exports = async function () {
  await cache.quit();
};
