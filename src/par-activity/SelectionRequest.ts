import { IRealMentionTweet } from ".";
import { EngagementType } from "./constants";

export class SelectionRequest {
  authorId: string;
  authorName: string;
  refTweetId: string | null;
  id: string;
  count: number;
  engagement: EngagementType;
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
