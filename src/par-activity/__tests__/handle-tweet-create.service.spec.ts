require("../../config");
import {
  ITweet,
  handleTweetCreateService,
  IRealMentionTweet,
  EngagementCountErrorMsg,
  EngagementType,
  EngagementTypeErrorMsg,
} from "..";
import { mockRealMention, mockTweet } from "../__mocks__/data";

const {
  isRealMention,
  getEngagementCount,
  getEngagementType,
  isCancelText,
  isFeedbackText,
  isPickCommand,
  setRealMention,
  setCommandText,
} = handleTweetCreateService;

describe("handleTweetCreateService", () => {
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
      await expect(getEngagementCount("4 retweets in one hour")).resolves.toBe(
        4
      );
      await expect(getEngagementCount("2 retweets tomorrow")).resolves.toBe(2);
      await expect(getEngagementCount("2.5 retweets tomorrow")).resolves.toBe(
        2
      );
      await expect(getEngagementCount("10e retweets tomorrow")).resolves.toBe(
        10
      );
      expect.assertions(4);
    });

    it("throws an error with the proper message when passed invalid arguments", async () => {
      const inputs = [
        {
          val: "X retweets in one hour",
          err: EngagementCountErrorMsg.CannotParse,
        },
        {
          val: "-1 retweets in one hour",
          err: EngagementCountErrorMsg.LessThanOne,
        },
        {
          val: "0 retweets today",
          err: EngagementCountErrorMsg.LessThanOne,
        },
        {
          val: "e retweets in tomorrow",
          err: EngagementCountErrorMsg.CannotParse,
        },
      ];
      for (const input of inputs) {
        await expect(getEngagementCount(input.val)).rejects.toThrow(input.err);
      }
    });
  });

  describe("getEngagementType", () => {
    it("returns the correct engagement type if it can be handled", async () => {
      const inputs = [
        { val: "2 retweets in one hour", type: EngagementType.Retweet },
        { val: "5 retw in 4 days", type: EngagementType.Retweet },
        { val: "5 ret in 4 days", type: EngagementType.Retweet },
        { val: "5 rets in 4 days", type: EngagementType.Retweet },
        { val: "5 followers in 4 days", type: EngagementType.Follow },
        { val: "5 follows in 4 days", type: EngagementType.Follow },
      ];
      for (const input of inputs) {
        await expect(getEngagementType(input.val)).resolves.toBe(input.type);
      }
    });

    it("throws an error with the correct error message when passed invalid arguments", async () => {
      const inputs = [
        { val: "2 in one hour", err: EngagementTypeErrorMsg.CannotParse },
        { val: "5 likes in 4 days", err: EngagementTypeErrorMsg.CannotHandle },
        { val: "5 fav in 4 days", err: EngagementTypeErrorMsg.CannotHandle },
      ];
      for (const input of inputs) {
        await expect(getEngagementType(input.val)).rejects.toThrow(input.err);
      }
    });
  });
});
