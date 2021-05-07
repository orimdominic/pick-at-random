import { IRealMentionTweet, ITweet } from "./ITweet";
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
export const isRealMention = (tweet: ITweet): boolean => {
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

/**
 * Create a real mention tweet object from a full valid tweet
 *
 * @param tweet - A valid tweet
 * @returns {IRealMentionTweet} a real mention tweet
 */
export const setRealMention = (tweet: ITweet): IRealMentionTweet => {
  return {
    createdAt: tweet.created_at,
    id: tweet.id_str,
    refTweetId: tweet.in_reply_to_status_id_str,
    authorName: tweet.user.screen_name,
    authorId: tweet.user.id_str,
    text: tweet.truncated ? tweet.extended_tweet!.full_text : tweet.text,
    urls: tweet.entities.urls,
  };
};

export async function handlePickAtRandomTweetCreateEvents(
  events: ITweet[],
  res: VercelResponse
): Promise<undefined> {
  const realMentions = events.filter(isRealMention);
  if (!realMentions.length) {
    res.status(200).send(null);
  }
  console.log("called");
  return;
}
