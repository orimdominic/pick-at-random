/**
 * @fileoverview
 * Persists mock selection requests based on argv in local
 * cache for testing
 * Run redis-server
 * @argument delay minutes from now to set selReq selection time
 * @argument engType The engagement type - retweets, likes etc
 * @argument count the selection count of the selReq
 * @argument numOfReqs the number of requests
 * @example yarn persist-mock-tweet --engType retweet --count 5 --delay 1 --numOfReqs
 *
delay in mins, numOfReqs is reqs to create
 */

import { IRealMentionTweet, SelectionRequest } from "../par-activity";
import {
  scheduleSelection,
  roundToNearestMinute,
} from "../par-activity/handle-tweet-create.service";
import minimist from "minimist";
let { engType, count, delay, numOfReqs } = minimist(process.argv.slice(2));

function genId(): string {
  return (Math.random() * Math.pow(10, 7)).toString(10).split(".")[0];
}

count = parseInt(count, 10) || 1;
delay = parseInt(delay, 10) || 1;
numOfReqs = parseInt(numOfReqs, 10) || 1;
engType = engType || "retweet";
const millisecsInOneMin = 60 * 1000;

const startTime = roundToNearestMinute(
  new Date(new Date().getTime() + parseInt(delay) * millisecsInOneMin)
);

(async () => {
  for (let i = 0; i < numOfReqs; i++) {
    const req = new SelectionRequest(
      {
        refTweetId: genId(),
        authorName: "author_name",
        authorId: "author_id",
        id: genId(),
      } as IRealMentionTweet,
      count,
      engType,
      startTime.toUTCString()
    );
    await scheduleSelection(req);
  }
})()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
