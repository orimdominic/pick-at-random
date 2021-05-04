import { VercelRequest, VercelResponse } from "@vercel/node";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { getChallengeResponse } from "../src/webhook-listener-helpers";

module.exports = (req: VercelRequest, res: VercelResponse) => {
  res.send("hello")
  const method = req.method?.toLowerCase();
  switch (method) {
    case "get": {
      const { crc_token } = req.query;
      if (typeof crc_token === "string" && crc_token.length) {
        return res.status(200).json({
          response_token: getChallengeResponse(crc_token),
        })
      }
      return res.send("");
    }
    default:
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .send(getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED));
  }
};
