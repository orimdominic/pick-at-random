import { getChallengeResponse } from "..";

describe("getChallengeResponse", () => {
  it("returns the correct challenge response from a crc token", () => {
    require("../../config");
    const testCrcToken = process.env.TEST_CRC_TOKEN as string;
    const testCrcResponse = process.env.TEST_CRC_RESPONSE as string;
    expect(getChallengeResponse(testCrcToken)).toBe(testCrcResponse);
  });
});
