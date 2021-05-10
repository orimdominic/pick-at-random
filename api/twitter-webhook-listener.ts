import { VercelRequest, VercelResponse } from "@vercel/node";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import {
  getChallengeResponse,
  setPickAtRandomAccountActivityHandler,
  handlePickAtRandomTweetCreateEvents,
} from "../src/webhook-listener-helpers";
require("../src/config");

const handleParActivity = setPickAtRandomAccountActivityHandler(
  handlePickAtRandomTweetCreateEvents
);

export default async (
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> => {
  const method = req.method?.toLowerCase();
  switch (method) {
    case "get": {
      try {
        const { crc_token } = req.query;
        if (typeof crc_token === "string" && crc_token.length) {
          return res.status(StatusCodes.OK).json({
            response_token: getChallengeResponse(crc_token),
          });
        }
      } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).send("");
      }
      return res.status(StatusCodes.BAD_REQUEST).send("");
    }

    case "post": {
      try {
        await handleParActivity(req.body, res);
        res.status(StatusCodes.OK).send(null);
      } catch (error) {
        console.error(error);
        return res.status(StatusCodes.BAD_REQUEST).send(error);
      }
      return res.status(StatusCodes.BAD_REQUEST).send("");
    }

    default: {
      return res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .send(getReasonPhrase(StatusCodes.METHOD_NOT_ALLOWED));
    }
  }
};
