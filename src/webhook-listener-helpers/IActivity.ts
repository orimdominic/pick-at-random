import { ITweet, IDirectMessageEvent } from ".";

/**
 * Twitter account activity
 */
export interface IActivity {
  for_user_id: string;
  source: string;
  target: string;
  is_blocked_by?: string;
  tweet_create_events?: ITweet[];
  direct_message_events?: IDirectMessageEvent[];
}
