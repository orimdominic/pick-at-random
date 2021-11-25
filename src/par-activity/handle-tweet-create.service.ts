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
  POTOFactory,
} from ".";

import { parTwitterClient } from "../par-twitter-client";
import { customChronoParser as timeParser } from "./time-parser";
import { cache } from "../cache";

/**
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
    refTweetId: tweet.in_reply_to_status_id_str || tweet.id_str,
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
  // at minimum, a pick command text can be '2 retweets tomorrow' or '4 replies on'
  return (
    Number.isInteger(parseInt(firstWord, 10)) && text.split(" ").length >= 3
  );
};

/**
 * Extracts and returns the engagement count in a command
 * tweet
 * @param {string} text - The command text
 * @returns {number} The engagement count
 */
export const getEngagementCount = (text: string): number => {
  /* could use NLP but Arabic numerals are a universal language */
  const [countStr] = text.split(" ");
  const count = parseInt(countStr.trim(), 10);
  if (Number.isNaN(count)) {
    throw new Error(EngagementCountErrorMsg.CannotParse);
  }
  if (count < 1) {
    throw new Error(EngagementCountErrorMsg.LessThanOne);
  }
  return count;
};

/**
 * Extracts and returns the engagement type from a command
 * tweet
 * @param {string} text - The command text
 * @returns {EngagementType} The engagement type (retweet, replies...)
 * @throws {Error}
 */
export const getEngagementType = (text: string): EngagementType => {
  const [, engagementType] = text.split(" ");
  if (engagementType.trim().length < 3) {
    throw new Error(EngagementTypeErrorMsg.CannotParse);
  }

  const sub = engagementType.trim().substring(0, 3);

  switch (sub) {
    case "ret":
      return EngagementType.Retweet;
    case "fav":
    case "like":
      return EngagementType.Favourite;
    default:
      // FIXME: When the algorithm for finding replies is developed, include it
      throw new Error(EngagementTypeErrorMsg.CannotHandle);
  }
};

/**
 * Parses and extracts the date for the random pick from the mention tweet
 * @param {IRealMentionTweet}
 * @returns {Date} The date for the random selection e.g "2021-05-01T05:30:06.000Z"
 * @throws {Error} if the date in the tweet is in the past or invalid
 */
export const getSelectionDate = ({
  cmdText,
  createdAt,
}: IRealMentionTweet): Date => {
  // this function runs on vibes and insha Allah. lol
  // converting human language to computer language is a feat!
  const refDate = new Date(createdAt);
  const [parsedResult] = timeParser.parse(cmdText as string, refDate, {
    forwardDate: true,
  }); // returns either a date string or null

  if (!parsedResult) {
    throw new Error(TimeParserErrorMsg.NullValue);
  }

  if (parsedResult.start.date().getTime() < Date.now()) {
    throw new Error(TimeParserErrorMsg.PastDate);
  }

  return parsedResult.start.date();
};

/**
 * Get the tweet id to make a random selection for
 * @param {IRealMentionTweet}
 * @returns {string} The id of the tweet that was replied to
 * @throws {Error} if the reply tweet id is null
 */
export const getSelectionTweetId = ({
  refTweetId,
}: IRealMentionTweet): string => {
  if (!refTweetId) {
    throw new Error(SelectionTweetIdErrorMsg.NoneFound);
  }
  return refTweetId;
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
  try {
    const selReqExpiryTimeInSecs =
      Math.floor(
        (new Date(selReq.selectionTime).getTime() - new Date().getTime()) /
        NumericConstant.MillisecsInOneSec
      ) + NumericConstant.SecsInOneHour; // One hour later
    // Push to list
    await cache.rpush(selReq.selectionTime, selReq.stringify());
    // delete after selReqExpiryTimeInSecs
    await cache.expire(selReq.selectionTime, selReqExpiryTimeInSecs);
  } catch (error) {
    console.error("error scheduling req", JSON.stringify(error, null, 2));
    throw new Error("An error occured in scheduling your request");
  }
};

/**
 * Schedules a selection request for expiration/cancellation and removal from
 * cache
 * @param {string} replyTweetId - The PAR reply tweet id
 * @param {SelectionRequest} selReq - The selection request
 */
export const scheduleExpiration = async (
  replyTweetId: string,
  selReq: SelectionRequest
): Promise<void> => {
  try {
    const selReqExpiryTimeInSecs =
      Math.floor(
        (new Date(selReq.selectionTime).getTime() - new Date().getTime()) /
        NumericConstant.MillisecsInOneSec
      ) + NumericConstant.SecsInOneHour; // One hour later
    await cache.setex(
      `${replyTweetId}-${selReq.authorId}`,
      selReqExpiryTimeInSecs,
      selReq.stringify()
    );
  } catch (error) {
    console.error(
      "error scheduling expiration",
      JSON.stringify(error, null, 2)
    );
    throw new Error("An error occured");
  }
};

/**
 * Removes a persisted selection from the cache
 * @param {IRealMentionTweet} mention - The mention request for a cancel
 * @returns {Promise<void>}
 */
export const cancelSelection = async (
  mention: IRealMentionTweet
): Promise<string> => {
  const req = await cache.get(`${mention.refTweetId}-${mention.authorId}`);
  if (!req) {
    throw new Error("Request to cancel not found in database");
  }

  const parsedReq = JSON.parse(req as string);
  const selReq = POTOFactory.buildSelectionRequest(parsedReq);

  const selReqsOnRequestToCancelDate = await cache.lrange(
    selReq.selectionTime,
    0,
    -1
  );
  const selReqsToKeep: SelectionRequest[] = selReqsOnRequestToCancelDate
    .map((r) => JSON.parse(r))
    .filter((r: SelectionRequest) => r.id !== selReq.id);

  await cache.del(selReq.selectionTime);

  if (selReqsToKeep.length) {
    const selReqExpiryTimeInSecs =
      Math.floor(
        (new Date(selReq.selectionTime).getTime() - new Date().getTime()) /
        NumericConstant.MillisecsInOneSec
      ) + NumericConstant.SecsInOneHour; // One hour later
    await cache.rpush(selReq.selectionTime, JSON.stringify(selReqsToKeep));
    // delete after selReqExpiryTimeInSecs
    await cache.expire(selReq.selectionTime, selReqExpiryTimeInSecs);
  }
  // delete cancellation key/value
  await cache.del(`${mention.refTweetId}-${mention.authorId}`);
  return mention.refTweetId as string;
};

/**
 * Generates a random message to notifiy a requester that that their
 * request has been scheduled
 * @param {SelectionRequest} selReq - The selection request
 * @returns {string} The success message
 */
export const createScheduleSuccessReply = (
  selReq: SelectionRequest
): string => {
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

  const reply = messages[Math.floor(Math.random() * messages.length)];
  return `${reply}

Reply this tweet with "@PickAtRandom cancel" to cancel the selection`;
};

export { parTwitterClient };
