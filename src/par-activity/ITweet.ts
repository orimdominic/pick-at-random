import { IUser } from ".";

/**
 * Interface for the that comes from Twitter
 */
export interface ITweet {
  created_at: string;
  id_str: string;
  text: string;
  extended_tweet?: { full_text: string };
  truncated: boolean;
  in_reply_to_status_id_str: string | null;
  in_reply_to_user_id_str: string | null;
  retweeted_status: { text: string } | null;
  is_quote_status: { text: string } | null;
  user: IUser;
}

/**
 * Interface of the tweet that made a request
 */
export interface IRealMentionTweet {
  createdAt: string;
  /**
   * The id of the tweet that made the request
   */
  id: string;
  /**
   * The id of the tweet to be monitored
   */
  refTweetId: string | null;
  /**
   * The screen name of the requester
   */
  authorName: string;
  /**
   * The user id of the Twitter user that made the request
   */
  authorId: string;
  text: string;
  cmdText?: string;
}
