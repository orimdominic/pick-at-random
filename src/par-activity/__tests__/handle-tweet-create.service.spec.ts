require("../../config");
import {
  ITweet,
  handleTweetCreateService,
  IRealMentionTweet,
  EngagementCountErrorMsg,
  EngagementType,
  EngagementTypeErrorMsg,
  TimeParserErrorMsg,
  SelectionTweetIdErrorMsg,
  SelectionRequest,
  NumericConstant,
} from "..";
import { mockRealMention, mockSelReq, mockTweet } from "../__mocks__/data";
import { cache } from "../../cache";
import {
  cancelSelection,
  scheduleExpiration,
} from "../handle-tweet-create.service";

const {
  isRealMention,
  getEngagementCount,
  getEngagementType,
  isCancelText,
  isFeedbackText,
  isPickCommand,
  setRealMention,
  setCommandText,
  getSelectionDate,
  getSelectionTweetId,
  scheduleSelection,
  roundToNearestMinute,
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

  describe("getSelectionDate", () => {
    const refDate = "Sat May 01 12:00 +0000 2021";

    it("returns a month-accurate selection date from a text", async () => {
      const vals = [
        { cmdText: "3 retweets in three months", createdAt: refDate, month: 7 },
        { cmdText: "3 retweets in eight months", createdAt: refDate, month: 0 },
      ];
      for (const v of vals) {
        const res = await getSelectionDate((v as unknown) as IRealMentionTweet);
        expect(res.getMonth()).toBe(v.month);
      }
    });

    it("returns an hour-accurate selection time from a text", async () => {
      const currentDate = new Date();
      const vals = [
        {
          cmdText: "Tomorrow at 6am",
          createdAt: currentDate.toISOString(),
        },
        {
          cmdText: "3 hours from now",
          createdAt: currentDate.toISOString(),
        },
        {
          cmdText: "Tomorrow by 6pm",
          createdAt: currentDate.toISOString(),
        },
        {
          cmdText: "6pm tomorrow",
          createdAt: currentDate.toISOString(),
        },
        {
          cmdText: "6pm tomorrow JST",
          createdAt: currentDate.toISOString(),
        },
        {
          cmdText: "Friday, 1st of Sept 2023. 19:00",
          createdAt: currentDate.toISOString(),
        },
      ];
      for (const v of vals) {
        const res = await getSelectionDate((v as unknown) as IRealMentionTweet);
        const timezoneOffsetInHours = res.getTimezoneOffset() / 60;
        expect(res.getUTCHours() - res.getHours()).toBe(timezoneOffsetInHours);
      }
    });

    it("returns a minute-accurate selection time from a text", async () => {
      const currentDate = new Date();
      const in3Hrs30Mins = new Date(
        currentDate.getTime() +
          3 *
            NumericConstant.SecsInOneHour *
            NumericConstant.MillisecsInOneSec +
          30 * NumericConstant.MillisecsInOneMin
      );
      const vals = [
        {
          cmdText: "Tomorrow at 6:30am",
          createdAt: currentDate.toISOString(),
          mins: 30,
          hour: 6,
        },
        {
          cmdText: "3 hours 33 mins from now",
          createdAt: currentDate.toISOString(),
          hour: in3Hrs30Mins.getHours() % 24,
          mins: in3Hrs30Mins.getMinutes(),
        },
        {
          cmdText: "Tomorrow by 6:13pm",
          createdAt: currentDate.toISOString(),
          hour: 18,
          mins: 13,
        },
        {
          cmdText: "6:10 pm WAT tomorrow",
          createdAt: currentDate.toISOString(),
          hour: 18,
          mins: 10,
        },
        {
          cmdText: "Friday, 1st of Sept 2023. 19:01 WAT",
          createdAt: currentDate.toISOString(),
          hour: 19,
          mins: 1,
        },
      ];
      for (const v of vals) {
        const res = await getSelectionDate((v as unknown) as IRealMentionTweet);
        expect(res.getMinutes()).toBeGreaterThanOrEqual(v.mins);
      }
    });

    it("returns the correct selection date on valid inputs", async () => {
      const vals = [
        {
          ...mockRealMention,
          cmdText: "3 retweets on february 4",
          createdAt: refDate,
          date: 4,
          month: 1,
          year: 2022,
        },
      ];
      for (const val of vals) {
        const parsedDate = await getSelectionDate(val);
        expect(parsedDate.getDate()).toBe(val.date);
        expect(parsedDate.getMonth()).toBe(val.month);
        expect(parsedDate.getFullYear()).toBe(val.year);
      }
    });

    it("throws the correct errors when passed an invalid/indecipherable date", async () => {
      const vals = [
        {
          ...mockRealMention,
          cmdText: "3 retweets in",
          createdAt: refDate,
          err: TimeParserErrorMsg.NullValue,
        },
        {
          ...mockRealMention,
          cmdText: "3 retweets last year",
          createdAt: refDate,
          err: TimeParserErrorMsg.PastDate,
        },
      ];
      for (const val of vals) {
        await expect(getSelectionDate(val)).rejects.toThrowError(val.err);
      }
    });
  });

  describe("getSelectionTweetId", () => {
    it("throws the correct error if the mention is not a reply", async () => {
      expect.assertions(1);
      const m: IRealMentionTweet = { ...mockRealMention, refTweetId: null };
      await expect(getSelectionTweetId(m)).rejects.toThrowError(
        SelectionTweetIdErrorMsg.NoneFound
      );
    });

    it("returns the id of the tweet replied to if the mention is a reply", async () => {
      expect.assertions(1);
      const inReplyTo = "ref_tweet_id";
      const m: IRealMentionTweet = {
        ...mockRealMention,
        refTweetId: inReplyTo,
      };
      await expect(getSelectionTweetId(m)).resolves.toBe(inReplyTo);
    });
  });

  describe("roundToNearestMinute", () => {
    it("rounds a date to the nearest minute", async () => {
      const currentDate = new Date();
      const currentDateMins = currentDate.getMinutes();
      const res = roundToNearestMinute(currentDate);
      expect(res.getMinutes()).toBe(currentDateMins);
      expect(res.getSeconds()).toBe(0);
    });
  });

  describe("scheduleSelection", () => {
    it("properly adds a selection request to cache", async () => {
      const rpush = jest.spyOn(cache, "rpush");
      await scheduleSelection(mockSelReq);
      expect(rpush).toHaveBeenCalledWith(
        mockSelReq.selectionTime,
        mockSelReq.stringify()
      );
    });

    it("properly sets the expiration time for a request added to cache", async () => {
      const selReqExpiryTimeInSecs =
        Math.floor(
          (new Date(mockSelReq.selectionTime).getTime() -
            new Date().getTime()) /
            NumericConstant.MillisecsInOneSec
        ) + NumericConstant.SecsInOneHour; // One hour later
      const expire = jest.spyOn(cache, "expire");
      await scheduleSelection(mockSelReq);
      expect(expire).toHaveBeenCalledWith(
        mockSelReq.selectionTime,
        selReqExpiryTimeInSecs
      );
    });
  });

  describe("scheduleExpiration", () => {
    it("properly sets the expiration time for a request for cancellation", async () => {
      const selReqExpiryTimeInSecs =
        Math.floor(
          (new Date(mockSelReq.selectionTime).getTime() -
            new Date().getTime()) /
            NumericConstant.MillisecsInOneSec
        ) + NumericConstant.SecsInOneHour; // One hour later
      const setex = jest.spyOn(cache, "setex");
      await scheduleExpiration("reply_tweet_id", mockSelReq);
      expect(setex).toHaveBeenCalledWith(
        "reply_tweet_id" + "-" + mockSelReq.authorId,
        selReqExpiryTimeInSecs,
        mockSelReq.stringify()
      );
    });
  });

  describe("cancelSelectionRequest", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("removes a valid selection request from the cache", async () => {
      const get = jest
        .spyOn(cache, "get")
        .mockImplementation(() => Promise.resolve(JSON.stringify(mockSelReq)));
      const lrange = jest
        .spyOn(cache, "lrange")
        .mockImplementation(() =>
          Promise.resolve([JSON.stringify(mockSelReq)])
        );
      const del = jest
        .spyOn(cache, "del")
        .mockImplementation(() => Promise.resolve(1));
      await cancelSelection(mockRealMention);
      expect(get).toHaveBeenCalledWith(
        `${mockRealMention.refTweetId}-${mockRealMention.authorId}`
      );
      expect(lrange).toHaveBeenCalledWith(mockSelReq.selectionTime, 0, -1);
      expect(del).toHaveBeenCalledWith(mockSelReq.selectionTime);
    });

    it("doesn't remove a selection request if the key isnt found", async () => {
      const get = jest
        .spyOn(cache, "get")
        .mockImplementation(() => Promise.resolve(null));
      const lrem = jest.spyOn(cache, "lrem");
      const del = jest.spyOn(cache, "del");
      await expect(cancelSelection(mockRealMention)).rejects.toThrowError();
      expect(get).toHaveBeenCalledTimes(1);
    });
  });

  // describe("getScheduleSuccessReply", () => {
  //   it("returns a pluralised engagement reply when engagement count > 1", () => {
  //     const reply = getScheduleSuccessReply({
  //       engagement: EngagementType.Retweet,
  //       count: 2,
  //       selectionTime: new Date().toISOString(),
  //     } as SelectionRequest);
  //     expect(reply).toContain(`${EngagementType.Retweet}s`);
  //   });

  //   it("doesn't return a string greater than 280 in length", () => {
  //     const reply = getScheduleSuccessReply({
  //       engagement: EngagementType.Retweet,
  //       count: 2,
  //       selectionTime: new Date().toISOString(),
  //     } as SelectionRequest);
  //     expect(reply.length).toBeLessThan(280);
  //   });
  // });
});
