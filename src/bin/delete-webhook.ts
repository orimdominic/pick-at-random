/**
 * @fileoverview
 * The contents of this file can be run via the `yarn delete-webhook`
 * Running this file deletes a webhook URL from the list of account
 * activity webhook URLs
 */

import * as readline from "readline";
const rl = readline.createInterface(process.stdin, process.stdout);
import * as util from "util";
import * as request from "request";
require("../config");

const del = util.promisify(request.delete);

const twitterOAuth = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY as string,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET as string,
  token: process.env.TWITTER_ACCESS_TOKEN as string,
  token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string,
};

rl.question(
  "Your Twitter development environment label: ",
  function (envLabel: string) {
    rl.question("Your webhook id: ", function (webhookId: string) {
      const requestOptions = {
        url: `https://api.twitter.com/1.1/account_activity/all/${envLabel}/webhooks/${webhookId}.json`,
        oauth: twitterOAuth,
      };
      (async (opts) => {
        try {
          const body = await del(opts);
          console.log("result", JSON.stringify(body));
        } catch (e) {
          console.error("error: ", JSON.stringify(e));
        }
      })(requestOptions);
      rl.close();
    });
  }
);
