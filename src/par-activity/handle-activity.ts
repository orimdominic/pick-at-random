import { IActivity, ITweet } from ".";
/**
 * Set dependencies for handleParActivity
 */
export function setParActivityHandler(
  handleTweetCreate: (ev: ITweet[]) => Promise<boolean>
) {
  /**
   * Handle account activity for only @PickAtRandom Twitter account
   * @param {IActivity} event - An account activity event
   */
  return async function handleParActivity(event: IActivity): Promise<boolean> {
    if (
      !event.for_user_id ||
      event.for_user_id !== process.env.PICKATRANDOM_USERID
    ) {
      return false;
    }
    if (event.tweet_create_events) {
      await handleTweetCreate(event.tweet_create_events);
      return true;
    }
    return true;
  };
}
