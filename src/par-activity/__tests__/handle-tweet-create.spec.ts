require("../../config");
import {
  ITweet,
  IRealMentionTweet,
  isRealMention,
  setRealMention,
  setCommandText,
  isCancelText,
  isFeedbackText,
  isPickCommand,
  handleTweetCreate,
  getEngagementCount,
  EngagementCountErrorMsg,
} from "..";
import { mockRealMention, mockTweet } from "../__mocks__/data";

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

describe("isCancelTweet", () => {
  it("returns true if the command tweet starts with 'cancel'", () => {
    expect(isCancelText("cancel")).toBe(true);
    expect(isCancelText("cancel!")).toBe(true);
    expect(isCancelText("feedback!")).toBe(false);
    expect(isCancelText("3 retweets on thursday")).toBe(false);
  });
});

describe("isFeedbackTweet", () => {
  it("returns true if the command tweet starts with 'feedback'", () => {
    expect(isFeedbackText("feedback:")).toBe(true);
    expect(isFeedbackText("feedback,")).toBe(true);
    expect(isFeedbackText("cancel i did not get my picks")).toBe(false);
    expect(isFeedbackText("3 retweets on thursday")).toBe(false);
  });
});

describe("isPickCommand", () => {
  it("returns true if the command tweet starts with a number", () => {
    expect(isPickCommand("3 retweets today")).toBe(true);
    expect(isPickCommand("3 retweets on thursday")).toBe(true);
    expect(isPickCommand("3 retweets")).toBe(false);
    expect(isPickCommand("feedback,")).toBe(false);
    expect(isPickCommand("cancel i did not get my picks")).toBe(false);
  });
});

describe("getEngagementCount", () => {
  it("returns the correct engagement count when passed valid arguments", async () => {
    let count = await getEngagementCount("4 retweets in one hour");
    expect(count).toBe(4);
    count = await getEngagementCount("2 retweets tomorrow");
    expect(count).toBe(2);
    count = await getEngagementCount("2.5 retweets tomorrow");
    expect(count).toBe(2);
    count = await getEngagementCount("10e retweets tomorrow");
    expect(count).toBe(10);
  });

  it("throws an error with the proper message when passed invalid arguments", async () => {
    const inputs = [
      {
        text: "X retweets in one hour",
        errMsg: EngagementCountErrorMsg.CannotParseToNumber,
      },
      {
        text: "-1 retweets in one hour",
        errMsg: EngagementCountErrorMsg.LessThanOne,
      },
      {
        text: "0 retweets today",
        errMsg: EngagementCountErrorMsg.LessThanOne,
      },
      {
        text: "e retweets in tomorrow",
        errMsg: EngagementCountErrorMsg.CannotParseToNumber,
      },
    ];
    for (const input of inputs) {
      await expect(getEngagementCount(input.text)).rejects.toThrow(input.errMsg);
    }

  });
});

describe("handleTweetCreate", () => {
  it("should respond with when tweets are not real", async () => {
    const events: ITweet[] = [
      {
        ...mockTweet,
        user: { ...mockTweet.user, screen_name: "PickAtRandom" },
      },
    ];
    const res = await handleTweetCreate(events);
    expect(res).toBe(false);
  });

  // TODO: Handle test mock for asserting that `handleFeedbackMentions` was called
  // when tweet has feedback
});
