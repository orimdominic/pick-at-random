import { SelectionRequest } from "../par-activity";

/**
 * Get requests for the current time from cache
 */
export async function getRequests(): Promise<SelectionRequest[]> {
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
