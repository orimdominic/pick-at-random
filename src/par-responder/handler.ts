import("../config");
import { EngagementType } from "../par-activity";
import {
  getRequests,
  handleFavouritedRequest,
  handleReplyRequests,
  handleRetweetRequest,
} from "./compute-respond.service";

module.exports.computeAndRespond = async () => {
  const selReqs = await getRequests();
  if (selReqs.length === 0) {
    return;
  }
  // TODO: Monitor rate limits!
  const [retweetRequests, favouritedRequests, replyRequests] = [
    selReqs
      .filter((r) => r.engagement === EngagementType.Retweet)
      .map((r) => handleRetweetRequest(r)),
    selReqs
      .filter((r) => r.engagement === EngagementType.Favourite)
      .map((r) => handleFavouritedRequest(r)),
    selReqs
      .filter((r) => r.engagement === EngagementType.Reply)
      .map((r) => handleReplyRequests(r)),
  ];

  await Promise.allSettled([
    ...retweetRequests,
    ...favouritedRequests,
    ...replyRequests,
  ]);

  return;
};
