/**
 * @file Manages environment configurations for the application
 */

import { config } from "dotenv";

enum EnvMode {
  Production = "production",
  Test = "test",
}

const env = process.env.NODE_ENV;
switch (env) {
  case EnvMode.Production:
    config();
    break;
  default:
    config({ path: ".local.env" });
    break;
}
