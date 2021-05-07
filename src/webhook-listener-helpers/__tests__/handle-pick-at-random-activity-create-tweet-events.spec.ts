require("../../utils/config");

import { ITweet, IRealMentionTweet, isRealMention, setRealMention } from "..";
import { mockTweet } from "../__mocks__/test-data";

describe("isRealMention", () => {
  it("returns false if a tweet is by PickAtRandom", () => {
    const tweetByPickAtRandom = {
      ...mockTweet,
      user: { ...mockTweet.user, screen_name: "PickAtRandom" },
    } as ITweet;
    const val = isRealMention(tweetByPickAtRandom);
    expect(val).toBe(false);
  });

  it("returns false if tweet is pure retweet", () => {
    const retweetNotQuotedReply = {
      ...mockTweet,
      is_quote_status: null,
    } as ITweet;
    const val = isRealMention(retweetNotQuotedReply);
    expect(val).toBe(false);
  });

  it("returns true if tweet is NOT by PickAtRandom", () => {
    const tweetByPickAtRandom = {
      ...mockTweet,
      user: { ...mockTweet.user, screen_name: "screen_name" },
    } as ITweet;
    const val = isRealMention(tweetByPickAtRandom);
    expect(val).toBe(true);
  });

  it("returns true if tweet is a quote", () => {
    const tweetByPickAtRandom = {
      ...mockTweet,
      is_quote_status: { text: "tweet_text" },
      user: { ...mockTweet.user, screen_name: "screen_name" },
    } as ITweet;
    const val = isRealMention(tweetByPickAtRandom);
    expect(val).toBe(true);
  });
});

describe("setRealMention", () => {
  it("sets `text` to full text if `text` was truncated", () => {
    const tweetFullText = "full text of tweet";
    const tweet: ITweet = {
      ...mockTweet,
      truncated: true,
      extended_tweet: { full_text: tweetFullText },
    };
    expect(setRealMention(tweet).text).toBe(tweetFullText);
  });
});
