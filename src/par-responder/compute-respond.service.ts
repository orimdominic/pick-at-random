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
    : `the selected retweeters are ${usernames
        .map((u) => `@${u}`)
        .join(", ")}`;
};

export const handleRetweetRequest = async (req: SelectionRequest) => {
  const users = await parTwitterClient.getRetweeters(req.refTweetId as string);
  const usernames: string[] = users
    .filter((u) => u.id !== req.authorId)
    .map((u) => `${u.username}`);

  const selectedRetweeters: string[] = pickAtRandom(usernames, req.count);
  const message = buildRetweetersResponse(selectedRetweeters);

  await parTwitterClient.respondWithSelectionList(req, message);
};

export const buildFavouritersResponse = (usernames: string[]): string => {
  return usernames.length === 1
    ? `the selected favouriter is ${usernames[0]}`
    : `the selected favouriters are ${usernames
        .map((u) => `@${u}`)
        .join(", ")}`;
};

export const handleFavouritedRequest = async (req: SelectionRequest) => {
  const users = await parTwitterClient.getFavouritersList(
    req.refTweetId as string
  );
  const usernames: string[] = users
    .filter((u) => u.id !== req.authorId)
    .map((u) => `${u.username}`);

  const selectedFavouriters: string[] = pickAtRandom(usernames, req.count);
  const message = buildFavouritersResponse(selectedFavouriters);

  await parTwitterClient.respondWithSelectionList(req, message);
};

// TODO: These buildXXXResponse should be all made into one fn, or we use a
// closure to hold the different texts in them
export const buildRepliersResponse = (usernames: string[]): string => {
  return usernames.length === 1
    ? `the selected replier is ${usernames[0]}`
    : `the selected repliers are ${usernames.map((u) => `@${u}`).join(", ")}`;
};

export const handleReplyRequests = async (req: SelectionRequest) => {
  try {
    const replies = await parTwitterClient.getTweetReplies(
      req.refTweetId as string
    );

    const userIdsThatRepliedToTweet = replies
      .filter(
        (r) =>
          ((r.author_id !== req.authorId) && (r.in_reply_to_user_id === req.authorId))
      )
      .map((r) => r.author_id as string);

    const users = await parTwitterClient.getUsersByIds(
      userIdsThatRepliedToTweet
    );
    const usernames: string[] = users.map((u) => `${u.username}`);
    const selectedRepliers: string[] = pickAtRandom(usernames, req.count);
    const message = buildRepliersResponse(selectedRepliers);
    console.log(message);

    // await parTwitterClient.respondWithSelectionList(req, message);
  } catch (error) {
    console.error("Error fetching replies", (error as Error).message);
  }
};
