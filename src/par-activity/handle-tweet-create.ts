import { ITweet, handleTweetCreateService, SelectionRequest } from ".";

/**
 * Handles tweet_create_events for the PickAtRandom Twitter account
 */
export async function handleTweetCreate(
  events: ITweet[],
  service: typeof handleTweetCreateService
): Promise<undefined> {
  events = events.filter(service.isFromTweetAuthor);

  const realMentions = events.filter(service.isRealMention);

  if (!realMentions.length) {
    return;
  }

  const mentions = realMentions
    .map(service.setRealMention)
    .map(service.setCommandText);

  const [cancelCommandlMentions, pickCommandMentions] = [
    mentions.filter((m) => service.isCancelText(m.cmdText as string)),
    mentions.filter((m) => service.isPickCommand(m.cmdText as string)),
  ];

  if (cancelCommandlMentions.length) {
    const cancelSelectionReqs = cancelCommandlMentions.map((cm) =>
      service.cancelSelection(cm)
    );
    const cancellationResults = await Promise.allSettled(cancelSelectionReqs);

    const giveLikeFeedbackToCancellationReqs = cancellationResults
      .filter((cr) => cr.status === "fulfilled")
      .map((cr) =>
        service.parTwitterClient.likeTweet(
          (cr as PromiseFulfilledResult<string>).value
        )
      );

    await Promise.allSettled(giveLikeFeedbackToCancellationReqs);
  }

  if (pickCommandMentions.length) {
    for (const mention of pickCommandMentions) {
      try {
        /*
        using Promise.all for this cos the design pattern helps catch
        any of the errors and rejects at once, which is what's needed
         */
        const [count, engagement, selectionDate] = await Promise.all([
          service.getEngagementCount(mention.cmdText as string),
          service.getEngagementType(mention.cmdText as string),
          service.getSelectionDate(mention),
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

        const reply = service.createScheduleSuccessReply(selReq);
        const replyTweet = await service.parTwitterClient.replyMention(
          mention.id,
          reply,
          mention.authorName
        );

        await service.scheduleExpiration(`${replyTweet?.id_str}`, selReq);
      } catch (e) {
        console.error(`make selection request for "${mention.id}" failed
        Error: ${(e as Error).message}`);
        // const { id, authorName } = mention;
        // await service.parTwitterClient.replyMention(
        //   id,
        //   `${(e as Error).message}`,
        //   authorName
        // );
        // Report to user? Remember twitter rate limits?
        // Report failure metric with sentry
      }
    }
  }
  return;
}
