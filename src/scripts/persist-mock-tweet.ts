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

require("../config");
import { IRealMentionTweet, SelectionRequest } from "../par-activity";
import {
  scheduleSelection,
  roundToNearestMinute,
} from "../par-activity/handle-tweet-create.service";
import minimist from "minimist";
let { engType, count, delay, numOfReqs } = minimist(process.argv.slice(2));

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
        refTweetId: "1463682275657273346",
        authorName: "@sudo_kaizen",
        authorId: "427089628",
        id: "",
      } as IRealMentionTweet,
      count,
      engType,
      startTime.toISOString()
    );
    await scheduleSelection(req);
    console.log("Scheduled for", req.selectionTime);
  }
})()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
