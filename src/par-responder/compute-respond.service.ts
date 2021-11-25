import { SelectionRequest } from "../par-activity";
import { cache } from "../cache";
import { parTwitterClient } from "../par-twitter-client";

/**
 * Get requests for the current time from cache
 */
export const getRequests = async (): Promise<SelectionRequest[]> => {
  const { roundToNearestMinute } = await import(
    "../par-activity/handle-tweet-create.service"
  );
  const currentTime = roundToNearestMinute(new Date()).toISOString();
  try {
    const cachedReqs = await cache.lrange(currentTime, 0, -1);

    if (!cachedReqs.length) {
      return [];
    }

    const selReqs: SelectionRequest[] = [];
    for (const req of cachedReqs) {
      selReqs.push(JSON.parse(req));
    }

    return selReqs;
  } catch (error) {
    console.error("ERROR getRequests", error);
    return [];
  }
};

/**
 * Pick and returns usernames from a username pool
 */
export const pickAtRandom = (
  usernamePool: string[],
  total: number
): string[] => {
  console.log("username pool", usernamePool)
  if (usernamePool.length <= total) {
    return usernamePool;
  }

  let counter = total;
  const selection: string[] = [];

  while (counter !== 0) {
    // Fortunately, the API does not return duplicates
    // Unfortunately, it doesn't return > 99 results
    const randomIndex = Math.floor(Math.random() * usernamePool.length);
    const selected = usernamePool[randomIndex];
    selection.push(selected);
    usernamePool.splice(randomIndex, 1);
    counter--;
  }
  return selection;
};

export const buildRetweetersResponse = (usernames: string[]): string => {
  return usernames.length === 1
    ? `the selected retweeter is ${usernames[0]}`
    : `the selected retweeters are - ${usernames
      // .map((u) => `@${u}`)
      .join(", ")}`;
};

export const handleRetweetRequest = async (req: SelectionRequest) => {
  const users = await parTwitterClient.getRetweeters(req.refTweetId as string);
  console.log("users length", users.length)
  const usernames: string[] = users
    .filter((u) => u.id !== req.authorId)
    .map((u) => `${u.username}`);
  console.log(usernames);

  const selectedRetweeters: string[] = pickAtRandom(usernames, req.count);
  const message = buildRetweetersResponse(selectedRetweeters);

  await parTwitterClient.respondWithSelectionList(req, message);
  // console.log(JSON.stringify(tweets))
};

export const buildFavouritersResponse = (usernames: string[]): string => {
  return usernames.length === 1
    ? `the selected favouriter is ${usernames[0]}`
    : `the selected favouriters are - ${usernames
      // .map((u) => `@${u}`)
      .join(", ")}`;
};

export const handleFavouritedRequest = async (req: SelectionRequest) => {
  const users = await parTwitterClient.getFavouritersList(req.refTweetId as string);
  const usernames: string[] = users
    .filter((u) => u.id !== req.authorId)
    .map((u) => `${u.username}`);
  console.log(usernames);

  const selectedFavouriters: string[] = pickAtRandom(usernames, req.count);
  const message = buildFavouritersResponse(selectedFavouriters);

  await parTwitterClient.respondWithSelectionList(req, message);
}
