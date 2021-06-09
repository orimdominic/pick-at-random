"use strict";
require("../config");
import { SelectionRequest } from "../par-activity";

module.exports.computeAndRespond = async () => {
  const selReqs = await getRequests();
  if (!selReqs.length) {
    return;
  }
  return {
    statusCode: 200,
    body: {
      requests: selReqs,
    },
  };
};

/**
 * Get requests for the current time from cache
 */
async function getRequests(): Promise<SelectionRequest[]> {
  const { cache } = await import("../cache");
  const { roundToNearestMinute } = await import(
    "../par-activity/handle-tweet-create.service"
  );
  const currentTime = roundToNearestMinute(new Date()).toUTCString();
  console.log("currentTime:", currentTime);
  const cachedReqs = await cache.lrange(currentTime, 0, -1);
  if (!cachedReqs.length) {
    await cache.quit();
    return [];
  }
  const selReqs: SelectionRequest[] = [];
  for (const req of cachedReqs) {
    selReqs.push(JSON.parse(req));
  }
  await cache.quit();
  return selReqs;
}
