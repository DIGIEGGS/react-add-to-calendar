import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    ".(css|less|scss)$": "identity-obj-proxy"
  }
};

export default config;
