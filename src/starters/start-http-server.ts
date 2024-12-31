import { typecheckPlugin } from "@jgoz/esbuild-plugin-typecheck";
import esbuild from "esbuild";
import path from "path";
import { buildHttpApp } from "../builder/build-http-app";
import { command } from "../console/command-builder";
import { srcPath, warlockPath } from "../utils";
import { cleanupTempFiles } from "../utils/cleanup-temp-files";
import {
  injectImportPathPlugin,
  nativeNodeModulesPlugin,
  startServerPlugin,
} from "./../esbuild";

export async function startHttpApp() {
  // Clean up old temp files before starting
  await cleanupTempFiles();

  const httpPath = await buildHttpApp();

  const builder = await esbuild.context({
    platform: "node",
    entryPoints: [httpPath],
    bundle: true,
    minify: false,
    packages: "external",
    sourcemap: "linked",
    sourceRoot: srcPath(),
    format: "esm",
    target: ["esnext"],
    outdir: path.resolve(warlockPath()),
    // Enable code splitting
    splitting: true,
    // Output chunks to a separate directory with meaningful names
    chunkNames: "chunks/[name]",
    // Ensure each entry point generates its own chunk
    outbase: warlockPath(),
    // Tree shaking for smaller bundles
    treeShaking: true,
    // Generate metafile for analysis
    metafile: true,
    plugins: [
      typecheckPlugin({
        watch: true,
      }),
      injectImportPathPlugin(),
      nativeNodeModulesPlugin,
      startServerPlugin,
      // buildReporterPlugin,
    ],
  });

  // Just watch without callback, the plugin will handle reporting
  builder.watch();
}

export function registerHttpDevelopmentServerCommand() {
  return command("dev").action(startHttpApp).preload("watch");
}
