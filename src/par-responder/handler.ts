"use strict";

import("../config");
import { getRequests } from "./compute-respond.service";

module.exports.computeAndRespond = async () => {
  const selReqs = await getRequests();
  if (!selReqs.length) {
    return;
  }
  // for await (const selReq of selReqs) {

  // }
  return {
    statusCode: 200,
    body: {
      requests: selReqs,
    },
  };
};
