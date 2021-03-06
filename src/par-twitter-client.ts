import TwitterApi, {
  TweetV1,
  TwitterApiReadWrite,
  UserV2,
} from "twitter-api-v2";
import { SelectionRequest, Message } from "./par-activity";

class ParTwitterClient {
  private client: TwitterApiReadWrite;

  /**
   * Initialise the parameters for PAR account
   */
  constructor() {
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
      const { data } = await this.client.v2.tweetRetweetedBy(tweetId, {
        "user.fields": ["username", "id"],
      });
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

    const response = `Hi! Based on your request ${tweetUrl}
${message}`;

    if (response.length <= 280) {
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
      return await this.client.v1.tweetThread(tweets);
    }
  }

  async getFavouritersList(tweetId: string) {
    try {
      const { data } = await this.client.v2.tweetLikedBy(tweetId, {
        "user.fields": ["username", "id"],
      });
      return data;
    } catch (error) {
      console.error("error fetching favouriters");
      return [];
    }
  }

  async getTweetReplies(tweetId: string) {
    const { data: tweet } = await this.client.v2.singleTweet(tweetId, {
      "tweet.fields": ["conversation_id"],
    });

    const { tweets } = await this.client.v2.search(
      `conversation_id:${tweet.conversation_id}`,
      {
        "tweet.fields": ["in_reply_to_user_id", "author_id"],
        max_results: 100,
      }
    );
    return tweets;
  }

  async getUsersByIds(userIds: string[]) {
    try {
      const { data } = await this.client.v2.users(userIds);
      return data;
    } catch (error) {
      console.error(
        "error fetching users by user ids",
        (error as Error).message
      );
      return [];
    }
  }
}

export const parTwitterClient = new ParTwitterClient();
