import { VercelRequest, VercelResponse } from "@vercel/node";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { getChallengeResponse } from "../src/webhook-listener-helpers";

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  const method = req.method?.toLowerCase();
  switch (method) {
    case "get": {
      try {
        const { crc_token } = req.query;
        if (typeof crc_token === "string" && crc_token.length) {
          return res.status(StatusCodes.OK).json({
            response_token: getChallengeResponse(crc_token as string),
          });
        }
      } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).send("");
      }
    }

    default: {
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .send(getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED));
    }
  }
};
