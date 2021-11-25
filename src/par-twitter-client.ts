import TwitterApi, {
  TweetV1,
  TwitterApiReadWrite,
  UserV2,
} from "twitter-api-v2";
require("../src/config");
import { SelectionRequest, Message } from "./par-activity";

class ParTwitterClient {
  private client: TwitterApiReadWrite;

  /**
   * Initialise the parameters for PAR account
   */
  constructor() {
    console.log(process.env.TWITTER_CONSUMER_KEY)
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY as string,
      appSecret: process.env.TWITTER_CONSUMER_SECRET as string,
      accessToken: process.env.TWITTER_PAR_ACCESS_TOKEN as string,
      accessSecret: process.env.TWITTER_PAR_ACCESS_TOKEN_SECRET as string,
    }).readWrite;
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
  ): Promise<TweetV1 | undefined> {
    // TODO: Use v2
    return await this.client.v1.tweet(`@${author} ${message}`, {
      in_reply_to_status_id: id,
    });
  }

  /**
   * Like a tweet
   * @param {string} tweetId - The id of the tweet to be liked
   */
  async likeTweet(tweetId: string): Promise<{ data: { liked: boolean } }> {
    return await this.client.v2.like(
      process.env.PICKATRANDOM_USERID as string,
      tweetId
    );
  }

  /**
   * Get retweets of a tweet
   * @param {string} tweetId - The id of the tweet
   */
  async getRetweeters(tweetId: string): Promise<UserV2[]> {
    try {
      const { data } = await this.client.v2.tweetRetweetedBy(tweetId);
      return data;
    } catch (error) {
      console.error("error fetching retweeters");
      return [];
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
  ): Promise<TweetV1 | TweetV1[]> {
    const tweetUrl = Message.TweetUrlBuilder.replace(
      "%screen_name%",
      req.authorName
    ).replace("%tweet_id%", req.id);

    const response = `@${req.authorName} Hi! Based on your request ${tweetUrl}
${message}`;

    if (response.length <= 280) {
      console.log(response)
      return await this.client.v1.tweet(response);
    } else {
      const words = response.split(" ");
      const tweets = [];
      let currentTweet = "";
      const maxTweetLength = 280;

      for (const word of words) {
        if (currentTweet.length + `${word} `.length > maxTweetLength) {
          tweets.push(currentTweet);
          currentTweet = `${word} `;
        } else {
          currentTweet = currentTweet.concat(`${word} `);
        }
      }

      if (currentTweet) {
        tweets.push(currentTweet);
      }
      JSON.stringify(tweets)
      return await this.client.v1.tweetThread(tweets);
    }
  }
}

export const parTwitterClient = new ParTwitterClient();
