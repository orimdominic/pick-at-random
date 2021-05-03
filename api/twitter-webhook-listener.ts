import { VercelRequest, VercelResponse } from "@vercel/node";
import httpStatusCode, { getReasonPhrase } from "http-status-codes";
import { getChallengeResponse } from "../src/webhook-listener-helpers";

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const method = req.method.toLowerCase();
  switch (method) {
    case "get": {
      const { crc_token } = req.query;
      if (typeof crc_token === "string" && crc_token.length) {
        res.status(200).json({
          response_token: getChallengeResponse(crc_token),
        });
      }
      res
        .status(httpStatusCode.BAD_REQUEST)
        .send(getReasonPhrase(httpStatusCode.BAD_REQUEST));
    }
    default:
      res
        .status(httpStatusCode.METHOD_NOT_ALLOWED)
        .send(getReasonPhrase(httpStatusCode.METHOD_NOT_ALLOWED));
      break;
  }
};
