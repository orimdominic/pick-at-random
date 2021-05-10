import { VercelResponse } from "@vercel/node";
import { IActivity, handlePickAtRandomTweetCreateEvents } from ".";
/**
 * Set dependencies for handlePickAtRandomAccountActivity
 */
export function setPickAtRandomAccountActivityHandler(
  handleTweetCreateEvents: typeof handlePickAtRandomTweetCreateEvents
) {
  /**
   * Handle account activity for only @PickAtRandom Twitter account
   * @param {IActivity} event - An account activity event
   */
  return async function handlePickAtRandomAccountActivity(
    event: IActivity,
    res: VercelResponse
  ): Promise<boolean> {
    if (
      !event.for_user_id ||
      event.for_user_id !== process.env.PICKATRANDOM_USERID
    ) {
      return false;
    }
    if (event.tweet_create_events) {
      await handleTweetCreateEvents(event.tweet_create_events, res);
    }
    return true;
  };
}
