import {
  IRealMentionTweet,
  ITweet,
  CommandType,
  EngagementCountErrorMsg,
  EngagementType,
  EngagementTypeErrorMsg,
  parTwitterClient,
} from ".";

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
 * Determines if a command text is a cancel text
 * @param {string} text - The command text
 * @returns {boolean} true if it is a cancel text
 */
export const isCancelText = (text: string): boolean =>
  text.startsWith(CommandType.Cancel);

/**
 * Determines if a command text is a feedback text
 * @param {string} text - The command text
 * @returns {boolean} true if it is a feedback text
 */
export const isFeedbackText = (text: string): boolean =>
  text.startsWith(CommandType.Feedback);

/**
 * Determines if a command text is a pick command
 * @param {string} text - The command text
 * @returns {boolean} true if it is a pick command
 */
export const isPickCommand = (text: string): boolean => {
  const [firstWord] = text.split(" ");
  // at minimum, a pick command text can be '2 retweets tomorrow'
  return (
    Number.isInteger(parseInt(firstWord, 10)) && text.split(" ").length >= 3
  );
};

/**
 * @param {IRealMentionTweet} mention - The mention tweet to handle
 * @returns { Promise<ITweet>}
 */
export const handleFeedbackMention = async ({
  authorName,
  id,
}: IRealMentionTweet): Promise<ITweet> => {
  const message = "Feedback received. Thanks!";
  return await parTwitterClient.replyMention(id, message, authorName);
};

/**
 * Extracts and returns the engagement count in a command
 * tweet
 * @param {string} text - The command text
 * @returns {Promise<number>} The engagement count
 * @throws {Error}
 */
export const getEngagementCount = async (text: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const [countStr] = text.split(" ");
    const count = parseInt(countStr.trim(), 10);
    if (Number.isNaN(count)) {
      reject(new Error(EngagementCountErrorMsg.CannotParse));
    }
    if (count < 1) {
      reject(new Error(EngagementCountErrorMsg.LessThanOne));
    }
    resolve(count);
  });
};

/**
 * Extracts and returns the engagement type from a command
 * tweet
 * @param {string} text - The command text
 * @returns {Promise<string>} The engagement count
 * @throws {Error}
 */
export const getEngagementType = async (text: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const [, engagementType] = text.split(" ");
    if (engagementType.trim().length < 3) {
      reject(new Error(EngagementTypeErrorMsg.CannotParse));
    }
    const sub = engagementType.trim().substring(0, 3);
    switch (sub) {
      case "ret":
        resolve(EngagementType.Retweet);
        break;
      case "fol":
        resolve(EngagementType.Follow);
        break;
      default:
        // FIXME: When the algorithm for finding replies is developed, include it
        reject(new Error(EngagementTypeErrorMsg.CannotHandle));
    }
  });
};

export { parTwitterClient };
