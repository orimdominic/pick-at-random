"use strict";

import("../config");
import { EngagementType } from "../par-activity";
import {
  buildRetweetersResponse,
  getRequests,
  pickAtRandom,
} from "./compute-respond.service";
import { parTwitterClient } from "../par-twitter-client";

module.exports.computeAndRespond = async () => {
  const selReqs = await getRequests();
  if (selReqs.length === 0) {
    return;
  }
  // TODO: Monitor rate limits!
  const [retweetRequests] = [
    selReqs.filter((r) => r.engagement === EngagementType.Retweet),
  ];
  if (retweetRequests.length) {
    for (const req of retweetRequests) {
      try {
        const retweets = await parTwitterClient.getRetweets(
          req.refTweetId as string
        );
        const selectedRetweeters: string[] = pickAtRandom(retweets, req);
        const message = buildRetweetersResponse(selectedRetweeters);
        await parTwitterClient.respondWithSelectionList(req, message);
      } catch (error) {
        console.error(
          `could not select retweeters for ${req.refTweetId}
Error:`,
          JSON.stringify(error, null, 2)
        );
      }
    }
  }
  return;
};
