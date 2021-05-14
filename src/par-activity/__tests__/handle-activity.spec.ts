require("../../config");
import {
  setParActivityHandler,
  handleTweetCreate,
  IActivity,
  ITweet,
  handleTweetCreateService,
} from "..";
import { mockTweet } from "../__mocks__/data";

describe("handleParActivity", () => {
  let handleParActivity: (activity: IActivity) => Promise<undefined>;

  const mockHandleTweetCreate = jest.fn(handleTweetCreate);

  beforeAll(() => {
    handleParActivity = setParActivityHandler(mockHandleTweetCreate);
  });

  it("should return undefined when event is not for @PickAtRandom", async () => {
    const ev = {
      for_user_id: "WRONG_PICKATRANDOMID",
    } as IActivity;
    const res = await handleParActivity(ev);
    expect(res).toBe(undefined);
  });

  it("should execute `handlePickAtRandomTweetCreateEvents` when the activity is a tweet create event", async () => {
    const ev: IActivity = {
      for_user_id: process.env.PICKATRANDOM_USERID as string,
      tweet_create_events: [mockTweet] as ITweet[],
      source: "",
      target: "",
    };
    await handleParActivity(ev);
    expect(mockHandleTweetCreate).toBeCalled();
    expect(mockHandleTweetCreate).toHaveBeenCalledTimes(1);
    expect(mockHandleTweetCreate).toHaveBeenCalledWith(
      ev.tweet_create_events,
      handleTweetCreateService
    );
  });
});
