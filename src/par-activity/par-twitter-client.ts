import Twitter from "twitter-lite";
import { TwitterEndpoint, ITweet } from ".";

class ParTwitterClient {
  private v1: Twitter;
  private v2: Twitter;

  /**
   * Initialise the parameters for PAR account
   */
  constructor() {
    const params = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
      access_token_key: process.env.TWITTER_PAR_ACCESS_TOKEN as string,
      access_token_secret: process.env
        .TWITTER_PAR_ACCESS_TOKEN_SECRET as string,
    };
    this.v1 = new Twitter({
      ...params,
    });
    this.v2 = new Twitter({
      extension: false,
      version: "2",
      ...params,
    });
  }

  /**
   * Reply a mention
   * @param {string} id - The id of the mention to reply
   * @param {string} message - The feedback message
   * @param {string} author - The screen name of the author e.g PickAtRandom
   * @returns {Promise<ITweet>} The tweeted feedback
   */
  async replyMention(
    id: string,
    message: string,
    author: string
  ): Promise<ITweet | undefined> {
    try {
      const resp = await this.v1.post<ITweet>(TwitterEndpoint.StatusUpdate, {
        status: `@${author} ${message}`,
        in_reply_to_status_id: id,
      });
      return resp;
    } catch (error) {
      // TODO: handle error via sentry
      console.error("parTwitterClient.replyMention", error);
    }
  }

  /**
   * Like a tweet
   * @param {string} id - The id of the tweet to be liked
   */
  async likeTweet(id: string) {
    console.log(id);
    try {
      const resp = await this.v2.post(
        `users/${process.env.PICKATRANDOM_USERID}/likes`,
        {
          tweet_id: id,
        }
      );
      console.log(resp);
      return resp;
    } catch (error) {
      // TODO: handle error via sentry
      console.error("parTwitterClient.likeTweet", JSON.stringify(error));
    }
  }
}

export const parTwitterClient = new ParTwitterClient();
