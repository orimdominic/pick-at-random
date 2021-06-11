import { ITweet, SelectionRequest } from "../par-activity";

/**
 * Get requests for the current time from cache
 */
export const getRequests = async (): Promise<SelectionRequest[]> => {
  const { cache } = await import("../cache");
  const { roundToNearestMinute } = await import(
    "../par-activity/handle-tweet-create.service"
  );
  const currentTime = roundToNearestMinute(new Date()).toISOString();
  try {
    const cachedReqs = await cache.lrange(currentTime, 0, -1);
    if (!cachedReqs.length) {
      await cache.quit();
      return [];
    }
    const selReqs: SelectionRequest[] = [];
    for (const req of cachedReqs) {
      selReqs.push(JSON.parse(req));
    }
    console.log("currentTime:", currentTime);
    console.log("selReqs:", JSON.stringify(selReqs, null, 2));
    await cache.quit();
    return selReqs;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const pickAtRandom = (
  pool: ITweet[],
  req: SelectionRequest
): string[] => {
  const usernames: string[] = pool
    .filter((r) => r.user.id_str !== req.authorId)
    .map((r) => `@${r.user.screen_name}`);
  if (pool.length <= req.count) {
    return usernames;
  }
  let counter = req.count;
  const selections: string[] = [];
  while (counter !== 0) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selection = usernames[randomIndex];
    selections.push(selection);
    pool.splice(randomIndex, 1);
    counter--;
  }
  return selections;
};

export const buildRetweetersResponse = (retweeters: string[]): string => {
  return retweeters.length === 1
    ? `
Here's one selected retweeter - ${retweeters[0]}`
    : `
${retweeters.length} retweeters as requested - ${retweeters.join(", ")}`;
};
