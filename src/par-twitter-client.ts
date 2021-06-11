import Twitter from "twitter-lite";
import {
  TwitterEndpointV1,
  ITweet,
  SelectionRequest,
  Message,
} from "./par-activity";
import request from "request";
import { promisify } from "util";
const post = promisify(request.post);

class ParTwitterClient {
  private v1: Twitter;
  private v2: Twitter;

  /**
   * Initialise the parameters for PAR account
   */
  constructor() {
    const oauth = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
      access_token_key: process.env.TWITTER_PAR_ACCESS_TOKEN as string,
      access_token_secret: process.env
        .TWITTER_PAR_ACCESS_TOKEN_SECRET as string,
    };
    this.v1 = new Twitter({
      ...oauth,
    });
    this.v2 = new Twitter({
      extension: false,
      version: "2",
      ...oauth,
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
      const resp = await this.v1.post<ITweet>(TwitterEndpointV1.StatusUpdate, {
        status: `@${author} ${message}`,
        in_reply_to_status_id: id,
      });
      return resp;
    } catch (error) {
      // TODO: handle error via sentry
      console.error("parTwitterClient.replyMention", error, null, 2);
    }
  }

  /**
   * Like a tweet
   * @param {string} id - The id of the tweet to be liked
   */
  async likeTweet(id: string): Promise<{ data: { liked: boolean } }> {
    try {
      const resp = await post({
        url: `https://api.twitter.com/2/users/${process.env.PICKATRANDOM_USERID}/likes`,
        oauth: {
          consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
          consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
          token: process.env.TWITTER_PAR_ACCESS_TOKEN as string,
          token_secret: process.env.TWITTER_PAR_ACCESS_TOKEN_SECRET as string,
        },
        json: {
          tweet_id: id,
        },
      });
      return resp.body;
    } catch (error) {
      console.error(
        // TODO: handle with sentry
        "parTwitterClient.likeTweet",
        JSON.stringify(error, null, 2)
      );
      return error;
    }
  }

  /**
   * Get retweets of a tweet
   * @param {string} id - The id of the tweet
   */
  async getRetweets(id: string): Promise<ITweet[]> {
    try {
      const retweets: ITweet[] = await this.v1.get<ITweet[]>(
        `${TwitterEndpointV1.StatusRetweets}/${id}`
      );
      return retweets;
    } catch (error) {
      console.error(
        // TODO: handle with sentry
        "parTwitterClient.getRetweets",
        JSON.stringify(error, null, 2)
      );
      return error;
    }
  }

  /**
   * Respond to a selection request tweet with the selected users
   * @param {string} id - The id of the request tweet to reply
   * @param {string} message - The message
   * @param {string} author - The screen name of the requester e.g PickAtRandom
   * @returns {Promise<ITweet>} The tweeted feedback
   */
  async respondWithSelectionList(
    req: SelectionRequest,
    message: string
  ): Promise<ITweet | undefined> {
    try {
      const resp = await this.v1.post<ITweet>(TwitterEndpointV1.StatusUpdate, {
        status: `@${
          req.authorName
        } Hi! ${message}
${Message.TweetUrlBuilder.replace(
          "%screen_name%",
          req.authorName
        ).replace("%tweet_id%", req.id)}`,
      });
      return resp;
    } catch (error) {
      // TODO: handle error via sentry
      console.error(
        "parTwitterClient.respondWithSelectionList",
        error,
        null,
        2
      );
    }
  }
}

export const parTwitterClient = new ParTwitterClient();
