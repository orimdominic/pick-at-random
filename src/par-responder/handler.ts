import("../config");
import { EngagementType } from "../par-activity";
import { getRequests, handleRetweetRequest } from "./compute-respond.service";

module.exports.computeAndRespond = async () => {
  const selReqs = await getRequests();
  if (selReqs.length === 0) {
    return;
  }
  // TODO: Monitor rate limits!
  const [retweetRequests] = [
    selReqs.filter((r) => r.engagement === EngagementType.Retweet),
  ];

  for (const retweetReq of retweetRequests) {
    console.log("running request", JSON.stringify(retweetReq))
    await handleRetweetRequest(retweetReq)
  }

  // if (retweetRequests.length) {
  //   await Promise.allSettled(
  //     retweetRequests.map((r) => handleRetweetRequest(r))
  //   );
  // }
  return;
};
