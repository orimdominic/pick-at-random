/**
 * @file Manages environment configurations for the application
 */

import { config } from "dotenv";

const env = process.env.NODE_ENV;
switch (env) {
  case "production":
    config();
    break;
  default:
    config({ path: ".local.env" });
    break;
}
