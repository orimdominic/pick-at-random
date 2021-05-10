import Twitter from "twitter-lite";
import {TwitterEndpoint} from "."
import { ITweet } from "./ITweet";

export class ParTwitterClient {
  private static client: Twitter;

  /**
   * Initialise the paramneters for PAR account
   */
  static init():void {
    if(ParTwitterClient.client){
      ParTwitterClient.client = new Twitter({
        extension: false,
        version: "2",
        consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
        access_token_key: process.env.TWITTER_PAR_ACCESS_TOKEN as string,
        access_token_secret: process.env
          .TWITTER_PAR_ACCESS_TOKEN_SECRET as string,
          bearer_token: process.env.TWITTER_BEARER_TOKEN
      });
    }
  }

  /**
   * Reply/Acknowledge a real mention with a feedback of the computed
   * result
   * @param {string} id - The id of the tweet to reply
   * @param {string} message - The feedback message
   * @returns {Promise<ITweet>} The tweeted feedback
   */
  static async replyTweet(id: string, message: string):Promise<ITweet> {
   return await this.client.post(TwitterEndpoint.StatusUpdate,{
      status: message,
      in_reply_to_status_id: id
    })
  }
}
