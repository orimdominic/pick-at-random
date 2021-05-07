require("../../utils/config");
import { VercelResponse } from "@vercel/node";
import {
  setPickAtRandomAccountActivityHandler,
  handlePickAtRandomTweetCreateEvents,
  IActivity,
  ITweet,
} from "..";

describe("handlePickAtRandomAccountActivity", () => {
  let handlePickAtRandomAccountActivity: (
    event: IActivity,
    res: VercelResponse
  ) => Promise<boolean>;

  beforeAll(() => {
    handlePickAtRandomAccountActivity = setPickAtRandomAccountActivityHandler(
      handlePickAtRandomTweetCreateEvents
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
      tweet_create_events: [{}] as ITweet[],
    } as unknown) as IActivity;
    const mockRes = {} as VercelResponse;
    const mockTweetCreateEventHandler = jest.fn(
      handlePickAtRandomTweetCreateEvents
    );
    await handlePickAtRandomAccountActivity(ev, mockRes);
    expect(mockTweetCreateEventHandler).toHaveBeenCalled();
    // expect(mockTweetCreateEventHandler).toHaveBeenCalledTimes(1);
    // expect(mockTweetCreateEventHandler).toHaveBeenCalledWith(mockRes)
  });
});
