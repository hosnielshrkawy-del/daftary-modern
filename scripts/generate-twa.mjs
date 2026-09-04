#!/usr/bin/env node
/**
 * Non-interactive TWA Android project generator.
 * Uses @bubblewrap/core so GitHub Actions never hits the interactive CLI.
 */
import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const core = require("@bubblewrap/core");

const { TwaManifest, TwaGenerator, ConsoleLog } = core;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "twa", "twa-manifest.json");
const outDir = path.join(root, "twa-android");
const keystorePath = process.env.TWA_KEYSTORE_PATH || path.join(outDir, "android.keystore");
const keystoreAlias = process.env.TWA_KEYSTORE_ALIAS || "android";

const raw = JSON.parse(await readFile(manifestPath, "utf8"));
if (raw.keyStore && !raw.signingKey) raw.signingKey = raw.keyStore;
if (!raw.signingKey) raw.signingKey = { path: "./android.keystore", alias: "android" };
if (raw.appVersionName && !raw.appVersion) raw.appVersion = raw.appVersionName;
if (raw.splashScreenFadeOutDuration == null) raw.splashScreenFadeOutDuration = 300;
raw.signingKey = {
  path: keystorePath,
  alias: keystoreAlias,
};

await mkdir(outDir, { recursive: true });
const normalizedPath = path.join(outDir, "twa-manifest.json");
await writeFile(normalizedPath, JSON.stringify(raw, null, 2));

const log = ConsoleLog ? new ConsoleLog("generate-twa") : console;
const manifest = await TwaManifest.fromFile(normalizedPath);
const generator = new TwaGenerator();

console.log("Generating TWA project into", outDir);
await generator.createTwaProject(outDir, manifest, log);

const gradlew = path.join(outDir, "gradlew");
try {
  await chmod(gradlew, 0o755);
} catch {
  /* generated wrapper may already be executable */
}

const sdk = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME || "";
if (sdk) {
  await writeFile(path.join(outDir, "local.properties"), `sdk.dir=${sdk.replaceAll("\\", "/")}\n`);
}

console.log("TWA Android project ready.");
