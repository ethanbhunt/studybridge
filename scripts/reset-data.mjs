import { rm } from "node:fs/promises";

await rm(new URL("../var/studybridge.json", import.meta.url), {
  force: true,
});

console.log("StudyBridge data will be recreated from data/seed.json on next start.");
