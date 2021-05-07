require("../../utils/config");

import {
  ITweet,
  IRealMentionTweet,
  isRealMention,
  setRealMention,
  setCommandText,
  isValidCommandText,
} from "..";
import { mockRealMention, mockTweet } from "../__mocks__/test-data";

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

describe("setCommandText", () => {
  it("parses and sets the correct command text on its tweet argument", () => {
    const mockExpectations = [
      { text: "@PickAtRandom hello", cmdText: "hello" },
      {
        text: "@PickAtRandom 3 retweets in 2 days",
        cmdText: "3 retweets in 2 days",
      },
      {
        text:
          "@PickAtRandom will do the job! @PickAtRandom 3 retweets in 2 days",
        cmdText: "3 retweets in 2 days",
      },
    ];

    for (const exp of mockExpectations) {
      const tweet: IRealMentionTweet = {
        ...mockRealMention,
        text: exp.text,
      };
      expect(setCommandText(tweet).cmdText).toBe(exp.cmdText);
    }
  });
});

describe("isValidCommandText", () => {
  it("returns true if the command text is valid", () => {
    const mockExpectations = [
      { cmdText: "hello", val: false },
      { cmdText: "@mykeels says hi", val: false },
      { cmdText: "cancel", val: true }, // for cancelling
      // { cmdText: "feedback", val: true }, // for feedback
      // { cmdText: "4 retweets tomorrow", val: true },
      // { cmdText: "3 retweets in 2 days", val: true },
      // { cmdText: "3 retweets on thursday", val: true },
    ];
    for (const exp of mockExpectations) {
      expect(isValidCommandText(exp.cmdText)).toBe(exp.val);
    }
  });
});
