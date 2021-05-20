import {
  IRealMentionTweet,
  ITweet,
  CommandType,
  EngagementCountErrorMsg,
  EngagementType,
  EngagementTypeErrorMsg,
  TimeParserErrorMsg,
  SelectionTweetIdErrorMsg,
  NumericConstant,
  SelectionRequest,
} from ".";

import { parTwitterClient } from "./par-twitter-client";
import { customChronoParser as timeParser } from "./time-parser";
import { cache } from "./cache";

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
      return reject(new Error(EngagementCountErrorMsg.CannotParse));
    }
    if (count < 1) {
      return reject(new Error(EngagementCountErrorMsg.LessThanOne));
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
export const getEngagementType = async (
  text: string
): Promise<EngagementType> => {
  return new Promise((resolve, reject) => {
    const [, engagementType] = text.split(" ");
    if (engagementType.trim().length < 3) {
      return reject(new Error(EngagementTypeErrorMsg.CannotParse));
    }
    const sub = engagementType.trim().substring(0, 3);
    switch (sub) {
      case "ret":
        resolve(EngagementType.Retweet);
        break;
      default:
        // FIXME: When the algorithm for finding replies is developed, include it
        reject(new Error(EngagementTypeErrorMsg.CannotHandle));
    }
  });
};

/**
 * Parses and extracts the date for the random pick from the mention tweet
 * @param {IRealMentionTweet}
 * @returns {Promise<Date>} The date for the random selection e.g "2021-05-01T05:30:06.000Z"
 * @throws {Error} if the date in the tweet is in the past or invalid
 */
export const getSelectionDate = async ({
  cmdText,
  createdAt,
}: IRealMentionTweet): Promise<Date> => {
  // this snippet of code runs on vibes and insha Allah. lol
  // converting human language to computer language is a feat!
  return new Promise((resolve, reject) => {
    const refDate = new Date(createdAt);
    const [parsedResult] = timeParser.parse(cmdText as string, refDate, {
      forwardDate: true,
    }); // returns either a date string or null
    if (!parsedResult) {
      return reject(new Error(TimeParserErrorMsg.NullValue));
    }
    if (parsedResult.start.date().getTime() < Date.now()) {
      return reject(new Error(TimeParserErrorMsg.PastDate));
    }
    return resolve(parsedResult.start.date());
  });
};

/**
 * Get the tweet id to make a random selection for
 * @param {IRealMentionTweet}
 * @returns {Promise<string>} The id of the tweet that was replied to
 * @throws {Error} if the reply tweet id is null
 */
export const getSelectionTweetId = async ({
  refTweetId,
}: IRealMentionTweet): Promise<string> => {
  return new Promise((resolve, reject) => {
    return !refTweetId
      ? reject(new Error(SelectionTweetIdErrorMsg.NoneFound))
      : resolve(refTweetId);
  });
};

/**
 * Rounds date to nearest minute
 * @param {Date} date - The date string to round e.g 2021-05-01T05:30:36.000Z
 * @returns {Date} The date rounded to the nearest minute
 * @example
 * roundToNearestMinute(2021-05-01T05:30:36.000Z)
 * // returns 2021-05-01T05:30:00.000Z
 */
export const roundToNearestMinute = (date: Date = new Date()): Date => {
  return new Date(
    Math.floor(date.getTime() / NumericConstant.MillisecsInOneMin) *
      NumericConstant.MillisecsInOneMin
  );
};

/**
 * Persists a selection request for selection in the future
 * @param {SelectionRequest} selReq - The selection request
 */
export const scheduleSelection = async (
  selReq: SelectionRequest
): Promise<void> => {
  // FIXME: Not handling errors here.. Scary!
  const selReqExpiryTimeInSecs =
    new Date(selReq.selectionTime).getTime() /
      NumericConstant.MillisecsInOneSec +
    NumericConstant.SecsInOneHour; // One hour later
  // Push to list
  await cache.rpush(selReq.selectionTime, selReq.stringify());
  // delete after selReqExpiryTimeInSecs
  await cache.expire(selReq.selectionTime, selReqExpiryTimeInSecs);
};

/**
 * Schedules a selection request for expiration and removal from
 * cache
 * @param {string} replyTweetId - The PAR reply tweet id
 * @param {SelectionRequest} selReq - The selection request
 */
export const scheduleExpiration = async (
  replyTweetId: string,
  selReq: SelectionRequest
): Promise<void> => {
  // FIXME: Not handling errors here.. Scary!
  const selReqExpiryTimeInSecs =
    new Date(selReq.selectionTime).getTime() /
      NumericConstant.MillisecsInOneSec +
    NumericConstant.SecsInOneHour; // One hour later
  await cache.setex(
    `${replyTweetId}-${selReq.authorId}`,
    selReqExpiryTimeInSecs,
    selReq.stringify()
  );
};

/**
 * Generates a random message to notifiy a requester that that their
 * request has been scheduled
 * @param {SelectionRequest} selReq - The selection request
 * @returns {string} The success message
 */
export const getScheduleSuccessReply = (selReq: SelectionRequest): string => {
  const engagement = `${selReq.engagement}${selReq.count > 1 ? "s" : ""}`;
  const selectionTime = new Date(selReq.selectionTime).toUTCString();
  const messages = [
    `Got you covered!
${selReq.count} randomly picked ${engagement} coming up on ${selectionTime}`,
    `Sealed!
Expect ${selReq.count} ${engagement} picked at random and delivered on ${selectionTime}`,
    `🤝 ${selReq.count} randomly picked ${engagement} coming up on ${selectionTime}`,
    `Got that!
${selReq.count} randomly picked ${engagement} scheduled to be delivered on ${selectionTime}`,
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  return `${message}.

Reply this tweet with "@PickAtRandom cancel" to cancel the selection`;
};

export { parTwitterClient };
