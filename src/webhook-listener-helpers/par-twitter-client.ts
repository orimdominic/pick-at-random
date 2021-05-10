import Twitter from "twitter-lite";
import { TwitterEndpoint } from ".";
import { ITweet } from "./ITweet";

class ParTwitterClient {
  private v1: Twitter;
  private v2: Twitter;

  /**
   * Initialise the parameters for PAR account
   */
  constructor() {
    this.v1 = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
      access_token_key: process.env.TWITTER_PAR_ACCESS_TOKEN as string,
      access_token_secret: process.env
        .TWITTER_PAR_ACCESS_TOKEN_SECRET as string,
    });
    this.v2 = new Twitter({
      extension: false,
      version: "2",
      consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
      access_token_key: process.env.TWITTER_PAR_ACCESS_TOKEN as string,
      access_token_secret: process.env
        .TWITTER_PAR_ACCESS_TOKEN_SECRET as string,
    });
  }

  /**
   * Reply/Acknowledge a real mention with a feedback of the computed
   * result
   * @param {string} id - The id of the mention to reply
   * @param {string} message - The feedback message
   * @param {string} author - The screen name of the author
   * @returns {Promise<ITweet>} The tweeted feedback
   */
  async replyMention(id: string, message: string, author: string): Promise<ITweet> {
    return await this.v1.post(TwitterEndpoint.StatusUpdate, {
      status: `@${author} ${message}`,
      in_reply_to_status_id: id,
    });
  }
}

export const parTwitterClient = new ParTwitterClient();
