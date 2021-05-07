require("../../utils/config");
import {
  setPickAtRandomAccountActivityHandler,
  handlePickAtRandomTweetCreateEvents,
} from "..";
import { IActivity } from "../IActivity";
import { VercelResponse } from "@vercel/node";

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
});
