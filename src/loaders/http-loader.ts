import { fileExists, putFile, putFileAsync } from "@mongez/fs";
import { rtrim, trim } from "@mongez/reinforcements";
import path from "path";
import { srcPath, warlockPath } from "../utils";
import {
  configFileLoaderName,
  createEssentialFiles,
} from "./../loaders/create-essential-files";
import { HttpModulesLoader } from "./../loaders/http-modules-loader";

export class HttpLoader {
  public paths: string[] = [];

  public httpDevelopmentPath = warlockPath("http.ts");

  public httpPath = "./start-http-application";

  public async init() {
    this.paths = [];

    await createEssentialFiles();

    putFile(
      warlockPath(`${this.httpPath}.ts`),
      'import { startHttpApplication } from "@warlock.js/core"; startHttpApplication();',
    );

    if (fileExists(srcPath("main.ts"))) {
      this.paths.push("src/main");
    }

    this.paths.push("./bootstrap", "./" + configFileLoaderName());

    this.paths.push(...this.fetchAppPaths());

    this.paths.push(this.httpPath);

    return this;
  }

  protected fetchAppPaths() {
    const appLoader = new HttpModulesLoader(
      path.resolve(process.cwd(), "src/app"),
    );

    const paths = appLoader.fetch();

    return paths.map(path => {
      path = rtrim(
        trim(path.replace(srcPath(), "").replace(/\\/g, "/"), "/"),
        ".ts",
      );

      return `src/${path}`;
    });
  }

  public async build() {
    await this.init();

    await putFileAsync(
      this.httpDevelopmentPath,
      this.paths.map(path => `import "${path}"`).join(";"),
    );
  }
}
