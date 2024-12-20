// import { typecheckPlugin } from "@jgoz/esbuild-plugin-typecheck";
import { spawn } from "child_process";
import esbuild from "esbuild";
import { srcPath, warlockPath } from "../utils";
import { nativeNodeModulesPlugin } from "./../esbuild";
import { startHttpApp } from "./start-http-server";

export async function startCliServer() {
  const command = process.argv[2];

  // make a special check for the development command
  if (command === "dev") {
    return startHttpApp();
  }

  const outputCliPath = warlockPath("cli.js");

  const { buildCliApp } = await import("../builder/build-cli-app");

  const cliPath = await buildCliApp();

  await esbuild.build({
    platform: "node",
    entryPoints: [cliPath],
    bundle: true,
    minify: false,
    packages: "external",
    sourcemap: "linked",
    sourceRoot: srcPath(),
    format: "cjs",
    target: ["esnext"],
    outfile: outputCliPath,
    // plugins: [typecheckPlugin(), nativeNodeModulesPlugin],
    plugins: [nativeNodeModulesPlugin],
  });

  const args = process.argv.slice(2);

  const processChild = spawn("node", [outputCliPath, ...args], {
    stdio: "inherit",
  });

  processChild.on("exit", code => {
    if (code !== null) {
      process.exit(code);
    }
  });
}
