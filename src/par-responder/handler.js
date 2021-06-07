"use strict";

module.exports.computeAndRespond = async (event) => {
  console.log("TEST_CRC_TOKEN", process.env.TEST_CRC_TOKEN);
  return {
    statusCode: 200,
    body: {
      status: "Working!!",
    },
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
