import { ITweet, handleTweetCreateService } from ".";

/**
 * Handles tweet_create_events for the PickAtRandom Twitter account
 */
export async function handleTweetCreate(
  events: ITweet[],
  service: typeof handleTweetCreateService
): Promise<undefined> {
  const realMentions = events.filter(service.isRealMention);
  if (!realMentions.length) {
    return;
  }
  const mentions = realMentions
    .map(service.setRealMention)
    .map(service.setCommandText);
  const [cancelMentions, feedbackMentions, pickCommandMentions] = [
    mentions.filter((m) => service.isCancelText(m.cmdText as string)),
    mentions.filter((m) => service.isFeedbackText(m.cmdText as string)),
    mentions.filter((m) => service.isPickCommand(m.cmdText as string)),
  ];
  if (cancelMentions.length) {
    // handle cancel
  }
  if (feedbackMentions.length) {
    // handle feedback
    for (const mention of feedbackMentions) {
      try {
        await service.handleFeedbackMention(mention);
      } catch (err) {
        console.error("handleFeedbackMentionError".toUpperCase(), err);
        // TODO: Report failure metric
      }
    }
  }

  if (pickCommandMentions.length) {
    for (const mention of pickCommandMentions) {
      try {
        /*
        using Promise.all for this cos the design pattern helps catch
        any of the errors in one place and responds adequately
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [count, engagementType, selectionDateStr, selectionTweetId] = await Promise.all([
          await service.getEngagementCount(mention.cmdText as string),
          await service.getEngagementType(mention.cmdText as string),
          await service.getSelectionDate(mention),
          await service.getSelectionTweetId(mention)
        ]);
        // TODO: Persist necessary data to db
        // TODO: Reply to tweet
      } catch (e) {
        console.error(JSON.stringify(e));
        console.error(`make selection request for "${mention.id}" failed`);
        const { id, authorName } = mention;
        await service.parTwitterClient.replyMention(
          id,
          `${e.message}`,
          authorName
        );
        // TODO: Report failure metric
      }
    }
  }
  return;
}
