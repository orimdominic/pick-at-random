import { getChallengeResponse } from "../index";

describe("getChallengeResponse", () => {
  it("returns the correct challenge response from a crc token", () => {
    require("../../utils/config");
    let testCrcToken = process.env.TEST_CRC_TOKEN as string;
    let testCrcResponse = process.env.TEST_CRC_RESPONSE as string;
    expect(getChallengeResponse(testCrcToken)).toBe(testCrcResponse);
  });

  it("returns null on undefined crc token", () => {
    expect(getChallengeResponse(undefined)).toBe(null);
  });
});
