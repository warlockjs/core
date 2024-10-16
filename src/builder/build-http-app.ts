import { ensureDirectoryAsync } from "@mongez/fs";
import { warlockPath } from "../utils/paths";
import {
  createAppBuilder,
  createBootstrapFile,
  createEnvironmentModeDisplayFile,
  loadEventFiles,
  loadLocalesFiles,
  loadMainFiles,
  loadRoutesFiles,
} from "./app-builder";
import { createConfigLoader } from "./config-loader-builder";

export async function buildHttpApp() {
  const { addImport, saveAs } = createAppBuilder();

  await ensureDirectoryAsync(warlockPath());

  const data = await Promise.all([
    createBootstrapFile(),
    createEnvironmentModeDisplayFile(),
    createConfigLoader(),
    loadMainFiles(),
    loadLocalesFiles(),
    loadEventFiles(),
    loadRoutesFiles(),
    createHttpApplicationStarter(),
  ]);

  addImport(...data);

  await saveAs("http");

  return warlockPath("http.ts");
}

export async function createHttpApplicationStarter() {
  const { addImport, addContent, saveAs } = createAppBuilder();

  addImport(`import { startHttpApplication } from "@warlock.js/core"`);

  addContent(`startHttpApplication();`);

  await saveAs("start-http-application");

  return `import "./start-http-application"`;
}
