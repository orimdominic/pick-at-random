require("../../utils/config");
import { VercelResponse } from "@vercel/node";
import {
  setPickAtRandomAccountActivityHandler,
  handlePickAtRandomTweetCreateEvents,
  IActivity,
  ITweet,
} from "..";
import { mockTweet } from "../__mocks__/test-data";

describe("handlePickAtRandomAccountActivity", () => {
  let handlePickAtRandomAccountActivity: (
    event: IActivity,
    res: VercelResponse
  ) => Promise<boolean>;

  const mockTweetCreateEventHandler = jest.fn(
    handlePickAtRandomTweetCreateEvents
  );

  beforeAll(() => {
    handlePickAtRandomAccountActivity = setPickAtRandomAccountActivityHandler(
      mockTweetCreateEventHandler
    );
  });

  it("should return false when event is not for @PickAtRandom", async () => {
    const ev = {
      for_user_id: "WRONG_PICKATRANDOMID",
    } as IActivity;
    const mockRes = {} as VercelResponse;
    const res = await handlePickAtRandomAccountActivity(ev, mockRes);
    expect(res).toBe(false);
  });

  it("should execute `handlePickAtRandomTweetCreateEvents` when the activity is a tweet create event", async () => {
    const ev = ({
      for_user_id: process.env.PICKATRANDOM_USERID as string,
      tweet_create_events: [mockTweet] as ITweet[],
    } as unknown) as IActivity;
    const mockRes = {} as VercelResponse;
    await handlePickAtRandomAccountActivity(ev, mockRes);
    expect(mockTweetCreateEventHandler).toBeCalled();
    expect(mockTweetCreateEventHandler).toHaveBeenCalledTimes(1);
    expect(mockTweetCreateEventHandler).toHaveBeenCalledWith(
      ev.tweet_create_events,
      mockRes
    );
  });
});
