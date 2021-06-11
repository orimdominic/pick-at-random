import { IRealMentionTweet } from ".";
import { EngagementType } from "./constants";

export class SelectionRequest {
  /**
   * The id of the requester
   */
  authorId: string;
  /**
   * The screen name of the requester
   */
  authorName: string;
  /**
   * The id of the tweet to monitor
   */
  refTweetId: string | null;
  /**
   * The id of the requesting tweet
   */
  id: string;
  /**
   * The number of the engagements to select
   */
  count: number;
  /**
   * The type of the engagement to monitor
   */
  engagement: EngagementType;
  /**
   * When to make the selection
   */
  selectionTime: string;
  constructor(
    { authorId, authorName, refTweetId, id }: IRealMentionTweet,
    count: number,
    engagement: EngagementType,
    selectionTime: string
  ) {
    this.authorId = authorId;
    this.authorName = authorName;
    this.refTweetId = refTweetId;
    this.id = id;
    this.count = count;
    this.engagement = engagement;
    this.selectionTime = selectionTime;
  }

  stringify(): string {
    return JSON.stringify(this);
  }
}
