import { IUser } from ".";
import { ITweetEntityUrl } from "./ITweetEntityUrl";

export interface ITweet {
  created_at: string;
  id_str: string;
  text: string;
  truncated: boolean;
  in_reply_to_status_id_str: string | null;
  in_reply_to_user_id_str: string | null;
  user: IUser;
  is_quote_status: false;
  entities: {
    urls: ITweetEntityUrl[];
  };
}
