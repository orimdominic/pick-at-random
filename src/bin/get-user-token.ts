/**
 * @fileoverview
 * The content of this file can be run via `yarn get-user-token`
 * It is used to get a user's token for maybe, adding to a subscribe
 * list
 */

import twitterAPI from "node-twitter-api";
import readline from "readline";
const rl = readline.createInterface(process.stdin, process.stdout);

(function getSubscriberToken() {
  const twitter = new twitterAPI({
    consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
    callback: "",
  });
  twitter.getRequestToken(function (
    err: Record<string, unknown>,
    requestToken: string,
    requestTokenSecret: string
  ) {
    console.log(
      "Log into Twitter as the user you want to authorize " +
        "and visit this URL:"
    );
    console.log(twitter.getAuthUrl(requestToken));
    rl.question("Enter your PIN: ", function (input: string) {
      const pin = input;
      twitter.getAccessToken(
        requestToken,
        requestTokenSecret,
        pin,
        function (
          err: Record<string, unknown>,
          accessToken: string,
          accessTokenSecret: string
        ) {
          console.log("Your access token: " + accessToken);
          console.log("Your token secret: " + accessTokenSecret);
          rl.close();
        }
      );
    });
  });
})();
