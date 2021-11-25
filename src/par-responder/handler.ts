import("../config");
import { EngagementType } from "../par-activity";
import { getRequests, handleFavouritedRequest, handleRetweetRequest } from "./compute-respond.service";

module.exports.computeAndRespond = async () => {
  const selReqs = await getRequests();
  if (selReqs.length === 0) {
    return;
  }
  // TODO: Monitor rate limits!
  const [retweetRequests, favouritedRequests] = [
    selReqs.filter((r) => r.engagement === EngagementType.Retweet),
    selReqs.filter((r) => r.engagement === EngagementType.Favourite),
  ];

  if (retweetRequests.length) {
    await Promise.allSettled(
      retweetRequests.map((r) => handleRetweetRequest(r))
    );
  }

  if (favouritedRequests.length) {
    await Promise.allSettled(
      favouritedRequests.map((r) => handleFavouritedRequest(r))
    );
  }

  return;
};
