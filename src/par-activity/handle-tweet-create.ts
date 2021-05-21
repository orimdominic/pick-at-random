import { ITweet, handleTweetCreateService, SelectionRequest } from ".";

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
  const [cancelMentions, pickCommandMentions] = [
    mentions.filter((m) => service.isCancelText(m.cmdText as string)),
    mentions.filter((m) => service.isPickCommand(m.cmdText as string)),
  ];
  if (cancelMentions.length) {
    //TODO: handle cancel
    // get the reply id
  }

  if (pickCommandMentions.length) {
    for (const mention of pickCommandMentions) {
      try {
        /*
        using Promise.all for this cos the design pattern helps catch
        any of the errors in one place and responds adequately
         */
        // eslint-disable @typescript-eslint/no-unused-vars
        const [count, engagement, selectionDate, _] = await Promise.all([
          await service.getEngagementCount(mention.cmdText as string),
          await service.getEngagementType(mention.cmdText as string),
          await service.getSelectionDate(mention),
          await service.getSelectionTweetId(mention),
        ]);
        const selectionDateStr = service
          .roundToNearestMinute(new Date(selectionDate))
          .toISOString();
        const selReq = new SelectionRequest(
          mention,
          count,
          engagement,
          selectionDateStr
        );
        await service.scheduleSelection(selReq);
        const reply = service.getScheduleSuccessReply(selReq);
        const replyTweet = await service.parTwitterClient.replyMention(
          mention.id,
          reply,
          mention.authorName
        );
        if (replyTweet) {
          await service.scheduleExpiration(`${replyTweet.id_str}`, selReq);
          return;
        }
        return;
      } catch (e) {
        console.error(JSON.stringify(e));
        console.error(`make selection request for "${mention.id}" failed`);
        const { id, authorName } = mention;
        await service.parTwitterClient.replyMention(
          id,
          `${e.message}`,
          authorName
        );
        // TODO: Report failure metric with sentry
      }
    }
  }
  return;
}
