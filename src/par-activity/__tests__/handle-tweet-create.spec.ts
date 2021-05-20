require("../../config");
import { ITweet, handleTweetCreate, handleTweetCreateService } from "..";
import { mockTweet } from "../__mocks__/data";

describe("handleTweetCreate", () => {
  it("returns undefined when tweets are not real", async () => {
    const events: ITweet[] = [
      {
        ...mockTweet,
        user: { ...mockTweet.user, screen_name: "PickAtRandom" },
      },
    ];
    const res = await handleTweetCreate(events, handleTweetCreateService);
    expect(res).toBe(undefined);
  });
});
