/**
 * @fileoverview
 * The content of this file can be run via `yarn register-webhook`
 * Running this file activates a CRC check from Twitter for
 * the validation of a webhook URL to receive account activity events
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
  token: process.env.TWITTER_ACCESS_TOKEN as string,
  token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string,
};

rl.question(
  "Your Twitter development environment label: ",
  function (envLabel: string) {
    rl.question("Your webhook URL: ", function (webhookUrl: string) {
      const requestOptions = {
        url: `https://api.twitter.com/1.1/account_activity/all/${envLabel}/webhooks.json`,
        oauth: twitterOAuth,
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
        },
        form: {
          url: webhookUrl,
        },
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
    });
  }
);
