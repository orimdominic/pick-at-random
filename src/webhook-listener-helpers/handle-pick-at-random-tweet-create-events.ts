import { ITweet } from "./ITweet";
import { VercelResponse } from "@vercel/node";

/**
 * Validates if a mention tweet is a quoted reply and also
 * not a pure retweet, and that it is not a mention by
 * self (@PickAtRandom)
 *
 * It returns false if the tweet is a pure retweet,
 * or is a tweet by @PickAtRandom, else, it returns true
 *
 * @param {ITweet} tweet - The tweet to validate
 * @returns {boolean} true if it is a real mention
 */
export const isRealMention = function (tweet: ITweet): boolean {
  // ignore retweets, but accept quotes
  if (tweet.retweeted_status && !tweet.is_quote_status) {
    return false;
  }
  // ignore tweets by self
  if (tweet.user.screen_name === process.env.PICKATRANDOM_SCREEN_NAME) {
    return false;
  }
  return true;
};

export async function handlePickAtRandomTweetCreateEvents(
  events: ITweet[],
  res: VercelResponse
): Promise<undefined> {
  console.log("called");
  return;
}
