import fs from "fs";

/**
 * Playwright has a bug with following symlinks. This hacks around it to make sure
 * the viewer is tested in all modes.
 */
export default function gobalSetup() {
  fs.copyFileSync(
    "./dual/ecr-viewer.spec.ts",
    "./integrated/ecr-viewer.spec.ts",
  );
}
