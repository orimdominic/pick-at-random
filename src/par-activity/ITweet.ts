import { IUser } from ".";
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

export interface IRealMentionTweet {
  createdAt: string;
  id: string;
  refTweetId: string | null;
  authorName: string;
  authorId: string;
  text: string;
  cmdText?: string;
}
