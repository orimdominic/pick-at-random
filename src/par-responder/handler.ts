"use strict";

import("../config");
import { cache } from "../cache";

module.exports.computeAndRespond = async (event: any) => {
  console.log("TEST_CRC_TOKEN", process.env.TEST_CRC_TOKEN);
  console.log("TWITTER_WEBHOOK_URL", process.env.TWITTER_WEBHOOK_URL);

  return {
    statusCode: 200,
    body: {
      status: "Working!!",
    },
  };
};
