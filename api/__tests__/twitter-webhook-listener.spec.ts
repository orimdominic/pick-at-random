import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { createResponse } from "node-mocks-http";
import twitterWebhookLambda from "../../api/twitter-webhook-listener";
import { VercelRequest } from "@vercel/node";

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
        crc_token: process.env.TEST_CRC_TOKEN as string,
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
        crc_token: process.env.TEST_CRC_TOKEN as string,
      },
    } as unknown) as VercelRequest;
    const mockRes = createResponse();
    await twitterWebhookLambda(mockReq, mockRes);
    expect(mockRes._getJSONData()).toHaveProperty("response_token");
  });

  it("responds with 405 on an unimplemented method", async () => {
    const mockReq = ({
      method: "PUT",
      query: {
        crc_token: process.env.TEST_CRC_TOKEN as string,
      },
    } as unknown) as VercelRequest;
    const mockRes = createResponse();
    const mockStatusFn = jest.spyOn(mockRes, "status");
    const mockSendFn = jest.spyOn(mockRes, "send");
    await twitterWebhookLambda(mockReq, mockRes);
    expect(mockStatusFn).toHaveBeenCalledWith(StatusCodes.NOT_IMPLEMENTED);
    expect(mockSendFn).toHaveBeenCalledWith(
      getReasonPhrase(StatusCodes.NOT_IMPLEMENTED)
    );
  });
});
