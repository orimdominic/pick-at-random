require("../src/config");
import { VercelRequest, VercelResponse } from "@vercel/node";
import { StatusCodes, getReasonPhrase } from "http-status-codes";
import {
  getChallengeResponse,
  setParActivityHandler,
  handleTweetCreate,
} from "../src/par-activity";


export default async (
  req: VercelRequest,
  res: VercelResponse
  ): Promise<VercelResponse> => {
    const method = req.method?.toLowerCase();
    switch (method) {
      case "get": {
        try {
          const { crc_token } = req.query;
          return res.status(StatusCodes.OK).json({
            response_token: getChallengeResponse(crc_token.toString()),
          });
        } catch (error) {
          return res.status(StatusCodes.BAD_REQUEST).send(error);
        }
      }

      case "post": {
        try {
        const handleParActivity = setParActivityHandler(handleTweetCreate);
        await handleParActivity(req.body);
        return res.status(StatusCodes.OK).send(getReasonPhrase(StatusCodes.OK));
      } catch (error) {
        console.error(error);
        return res.status(StatusCodes.BAD_REQUEST).send(error);
      }
    }

    default: {
      return res
        .status(StatusCodes.NOT_IMPLEMENTED)
        .send(getReasonPhrase(StatusCodes.NOT_IMPLEMENTED));
    }
  }
};
