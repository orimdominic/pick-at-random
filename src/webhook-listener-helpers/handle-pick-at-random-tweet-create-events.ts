import { ITweet } from "./ITweet";
import { VercelResponse } from "@vercel/node";

export async function handlePickAtRandomTweetCreateEvents(
  events: ITweet[],
  res: VercelResponse
): Promise<undefined> {
  console.log("called");
  return;
}
