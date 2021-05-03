import { VercelRequest, VercelResponse } from "@vercel/node";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { getChallengeResponse } from "../src/webhook-listener-helpers";

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const method = req.method.toLowerCase();
  switch (method) {
    case "get": {
      const { crc_token } = req.query;
      if (typeof crc_token === "string" && crc_token.length) {
        return res.status(200).json({
          response_token: getChallengeResponse(crc_token),
        });
      }
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(getReasonPhrase(StatusCodes.BAD_REQUEST));
    }
    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .send(getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED));
      break;
  }
};
