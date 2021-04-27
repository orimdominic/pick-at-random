require("./config");
import crypto from "crypto";
const OAuth = require("oauth-1.0a");

export const consumer = {
  key: process.env.TWITTER_CONSUMER_KEY as string,
  secret: process.env.TWITTER_CONSUMER_SECRET as string,
};

export const token = {
  key: process.env.TWITTER_ACCESS_TOKEN as string,
  secret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string,
};

export const bearer = process.env.TWITTER_BEARER_TOKEN as string;

export const twitterOAuth = OAuth({
  consumer: {
    key: process.env.TWITTER_CONSUMER_KEY as string,
    secret: process.env.TWITTER_CONSUMER_SECRET as string,
  },
  signature_method: "HMAC-SHA1",
  hash_function: (baseString: string, key: string) =>
    crypto.createHmac("sha1", key).update(baseString).digest("base64"),
});
