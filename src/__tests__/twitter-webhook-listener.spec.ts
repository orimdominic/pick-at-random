import { StatusCodes } from "http-status-codes";
import { createResponse } from "node-mocks-http";
import twitterWebhookLambda from "../../api/twitter-webhook-listener";
import { VercelRequest } from "@vercel/node";
require("../utils/config");

describe("twitter webhook listener", () => {
  it("[GET /] should return 400 when crc_token is not supplied", async () => {
    const mockReq = { method: "GET" } as VercelRequest;
    const mockRes = createResponse();
    await twitterWebhookLambda(mockReq, mockRes);
    expect(mockRes._getStatusCode()).toBe(StatusCodes.BAD_REQUEST);
  });

  it("[GET /] should return 200 when crc_token is supplied", async () => {
    const mockReq = ({
      method: "GET",
      query: {
        crc_token: "token",
      },
    } as unknown) as VercelRequest;
    const mockRes = createResponse();
    await twitterWebhookLambda(mockReq, mockRes);
    expect(mockRes._getStatusCode()).toBe(StatusCodes.OK);
  });

  it("[GET /] should return `response_token` in a JSON", async () => {
    const mockReq = ({
      method: "GET",
      query: {
        crc_token: "token",
      },
    } as unknown) as VercelRequest;
    const mockRes = createResponse();
    await twitterWebhookLambda(mockReq, mockRes);
    expect(mockRes._getJSONData()).toHaveProperty("response_token");
  });
});
