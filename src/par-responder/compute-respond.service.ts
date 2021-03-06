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
  // pull bot username from env
  usernamePool = usernamePool.filter((username) => {
    return username.toLowerCase() !== "pickatrandom";
  });

  const uniqueUsernames = [...new Set(usernamePool)];
  if (uniqueUsernames.length <= total) {
    return uniqueUsernames;
  }

  let counter = total;
  const selection: string[] = [];

  while (counter !== 0) {
    const randomIndex = Math.floor(Math.random() * uniqueUsernames.length);
    const selected = uniqueUsernames[randomIndex];
    selection.push(selected);
    uniqueUsernames.splice(randomIndex, 1);
    counter--;
  }
  return selection;
};

export const buildTweetResponse = (usernames: string[], single: string, multiple: string): string => {
  if(!usernames?.length){
    return `Oops! There are no ${single} entries for your tweet at the moment.
You can request at a later time.`
  }
  return usernames.length === 1
    ? "the selected " + single + " is @" + usernames[0]
    : `the selected ${multiple} are ${usernames.map((u) => `@${u}`).join(", ")}`;
};

export const handleRetweetRequest = async (req: SelectionRequest) => {
  const users = await parTwitterClient.getRetweeters(req.refTweetId as string);
  const usernames: string[] = users
    .filter((u) => u.id !== req.authorId)
    .map((u) => `${u.username}`);

  const selectedRetweeters: string[] = pickAtRandom(usernames, req.count);
  const message = buildTweetResponse(selectedRetweeters, "retweeter", "retweeters");

  await parTwitterClient.respondWithSelectionList(req, message);
};

export const handleFavouritedRequest = async (req: SelectionRequest) => {
  const users = await parTwitterClient.getFavouritersList(
    req.refTweetId as string
  );
  const usernames: string[] = users
    .filter((u) => u.id !== req.authorId)
    .map((u) => `${u.username}`);

  const selectedFavouriters: string[] = pickAtRandom(usernames, req.count);
  const message = buildTweetResponse(selectedFavouriters, "favouriter", "favouriters");

  await parTwitterClient.respondWithSelectionList(req, message);
};

export const handleReplyRequests = async (req: SelectionRequest) => {
  try {
    const replies = await parTwitterClient.getTweetReplies(
      req.refTweetId as string
    );

    const userIdsThatRepliedToTweet = replies
      .filter((r) => r.author_id !== req.authorId)
      .map((r) => r.author_id as string);

    const users = await parTwitterClient.getUsersByIds(
      userIdsThatRepliedToTweet
    );
    const usernames: string[] = users.map((u) => `${u.username}`);
    const selectedRepliers: string[] = pickAtRandom(usernames, req.count);
    const message = buildTweetResponse(selectedRepliers, "replier", "repliers");

    await parTwitterClient.respondWithSelectionList(req, message);
  } catch (error) {
    console.error("Error fetching replies", (error as Error).message);
  }
};
