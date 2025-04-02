import fs from "fs";

/**
 * Playwright has a bug with following symlinks. This hacks around it to make sure
 * the viewer is tested in all modes.
 */
export default function gobalTeardown() {
  fs.rmSync("./integrated/ecr-viewer.spec.ts");
}
