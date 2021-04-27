import got from "got";
import { twitterOAuth, token as twitterToken } from "../utils";

const url = `https://api.twitter.com/1.1/account_activity/all/${process.env.TWITTER_WEBHOOK_ENV}/webhooks.json?url=${process.env.WEBHOOK_URL}`;

(async () => {
  try {
    const { body } = await got.post(url, {
      headers: twitterOAuth.toHeader(
        twitterOAuth.authorize({ url, method: "POST" }, twitterToken)
      ),
      responseType: "json",
    });
    console.log(body);
  } catch (e) {
    console.error(e);
  }
})();