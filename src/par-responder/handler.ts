"use strict";

require("../config");
import { getRequests } from "./compute-respond.service";

module.exports.computeAndRespond = async () => {
  const selReqs = await getRequests();
  if (!selReqs.length) {
    return;
  }
  return {
    statusCode: 200,
    body: {
      requests: selReqs,
    },
  };
};
