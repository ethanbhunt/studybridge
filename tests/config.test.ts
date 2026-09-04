import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readConfig } from "../src/config.js";

describe("configuration", () => {
  it("uses local defaults", () => {
    const config = readConfig({}, "/project");
    assert.equal(config.port, 3000);
    assert.equal(config.dataFilename, "/project/var/studybridge.json");
    assert.equal(config.seedFilename, "/project/data/seed.json");
    assert.equal(config.publicDirectory, "/project/public");
  });

  it("uses the deployment port and data path", () => {
    const config = readConfig(
      { PORT: "8080", STUDYBRIDGE_DATA_FILE: "/data/app.json" },
      "/project",
    );
    assert.equal(config.port, 8080);
    assert.equal(config.dataFilename, "/data/app.json");
  });

  it("rejects an invalid port", () => {
    assert.throws(() => readConfig({ PORT: "three" }, "/project"));
    assert.throws(() => readConfig({ PORT: "70000" }, "/project"));
  });
});
