/**
 * @fileoverview
 * The content of this file can be run via `yarn create-subscription`
 * When this script is run with the correct arguments, it subscribes
 * the webhook URL to a user's account activity events.
 * The auth info is that of the user's
 * https://developer.twitter.com/en/docs/twitter-api/premium/account-activity-api/api-reference/aaa-premium#put-account-activity-all-env-name-webhooks-webhook-id
 */

import * as readline from "readline";
const rl = readline.createInterface(process.stdin, process.stdout);
import * as util from "util";
import * as request from "request";
require("../config");

const post = util.promisify(request.post);

const twitterOAuth = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
};

rl.question(
  "Your Twitter development environment label: ",
  function (envLabel: string) {
    rl.question(
      "The user's token first and the token secret, both separated by a space: ",
      function (userTokens: string) {
        const [token, token_secret] = userTokens.split(" ");
        const requestOptions = {
          url: `https://api.twitter.com/1.1/account_activity/all/${envLabel}/subscriptions.json`,
          oauth: { ...twitterOAuth, token, token_secret },
        };
        (async (opts) => {
          try {
            const body = await post(opts);
            console.log("result", JSON.stringify(body));
          } catch (e) {
            console.error("error: ", JSON.stringify(e));
          }
        })(requestOptions);
        rl.close();
      }
    );
  }
);
