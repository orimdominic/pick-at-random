import {
  IActivity,
  ITweet,
  handleTweetCreateService as IHandleTweetCreateService,
  handleTweetCreateService,
} from ".";

/**
 * Set dependencies for handleParActivity
 */
export function setParActivityHandler(
  handleTweetCreate: (
    ev: ITweet[],
    handleTweetCreateService: typeof IHandleTweetCreateService
  ) => Promise<undefined>
) {
  /**
   * Handle account activity for only @PickAtRandom Twitter account
   * @param {IActivity} event - An account activity event
   */
  return async function handleParActivity(
    event: IActivity
  ): Promise<undefined> {
    if (
      !event.for_user_id ||
      event.for_user_id !== process.env.PICKATRANDOM_USERID
    ) {
      return;
    }
    if (event.tweet_create_events) {
      await handleTweetCreate(
        event.tweet_create_events,
        handleTweetCreateService
      );
      return;
    }
    return;
  };
}
