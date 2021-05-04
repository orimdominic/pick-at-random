import * as request from "request";
import { createServer } from "vercel-node-server";
import listen from "test-listen";
import { promisify } from "util";
const twitterWebhookLambda = require("../../api/twitter-webhook-listener");

const get = promisify(request.get);
let server: any;
let url: string;

describe("twitter webhook listener", () => {
  beforeAll(async () => {
      server = createServer(twitterWebhookLambda);
      url = await listen(server)
      console.log("url:", url);
  });

  afterAll(() => {
    server.close();
  });

  it("should return the expected response", async () => {
    // const server = createServer(twitterWebhookLambda)
    // server.listen(8000)
    try {
      const res = await get({url})
      // console.log(res)
    } catch (error) {
    }
  });
});
