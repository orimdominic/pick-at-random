import { IRealMentionTweet, ITweet, CommandType } from ".";
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
 * @param {ITweet} tweet - A valid tweet
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

/**
 * Parses the text of a real mention tweet to extract
 * and set the command text of the tweet
 *
 * @param {IRealMentionTweet} tweet - a real mention tweet
 * @returns {IRealMentionTweet} - a tweet containing a command text if any
 */
export const setCommandText = (tweet: IRealMentionTweet): IRealMentionTweet => {
  const lastMentionIndex = tweet.text.lastIndexOf(
    `${process.env.PICKATRANDOM_SCREEN_NAME}`
  );
  const cmdText = tweet.text
    .substring(lastMentionIndex)
    .replace(`${process.env.PICKATRANDOM_SCREEN_NAME} `, "")
    .toLowerCase()
    .trim();
  return {
    ...tweet,
    cmdText,
  };
};

/**
 * Validates a command text
 * @param {string} text - The command text
 * @returns {boolean} true if the command text is valid
 */
export const isValidCommandText = (text: string): boolean => {
  if (text.length === 0) {
    return false;
  }
  if (
    text.startsWith(CommandType.Feedback) ||
    text.startsWith(CommandType.Cancel)
  ) {
    return true;
  }
  const wordsArr = text.split(" ");
  // if the text doesn't start with a number or 'cancel' or 'feedback'
  const [firstWord] = wordsArr;
  if (!Number.isInteger(parseInt(firstWord, 10))) {
    return false;
  }
  // at minimum, the text should be like '4 retweets tomorrow'
  if (wordsArr.length < 3) {
    return false;
  }
  return true;
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
