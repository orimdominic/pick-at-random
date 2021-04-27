/**
 * @fileoverview
 * Sample test for Travis
 */
import {add} from "./"

describe("add", () => {
  it("should return the correct additive value of two integers", () => {
    expect(add(1,10)).toBe(11)
  })
})