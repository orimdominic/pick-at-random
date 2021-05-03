/**
 * @file Manages environment configurations for the application
 */

import { config } from "dotenv";

const envMode = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
};

const env = process.env.NODE_ENV || envMode.DEVELOPMENT;
switch (env) {
  case envMode.PRODUCTION:
    config();
    break;
  case envMode.TEST:
    config({ path: ".test.env" });
    break;
  default:
    config({ path: ".dev.env" });
    break;
}
