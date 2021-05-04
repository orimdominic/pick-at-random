import { createHmac } from "crypto";

/**
 * Creates and returns the required challenge response from
 * the challenge-response check token from Twitter
 * @param {string} crcToken - The challenge response check token
 * @returns {string | null} The token
 */
export function getChallengeResponse(crcToken: string): string | null {
  if (!crcToken) {
    return null;
  }
  const consumerSecret = process.env.TWITTER_CONSUMER_SECRET as string;
  return `sha256=${createHmac("sha256", consumerSecret)
    .update(crcToken)
    .digest("base64")}`;
}
