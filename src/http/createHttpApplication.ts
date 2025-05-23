import config from "@mongez/config";
import { log } from "@warlock.js/logger";
import { router } from "../router";
import { setBaseUrl } from "../utils/urls";
import { httpConfig } from "./config";
import { registerHttpPlugins } from "./plugins";
import { getServer, startServer } from "./server";

export async function createHttpApplication() {
  const server = startServer();

  await registerHttpPlugins(server);

  router.scan(server);

  const port = httpConfig("port");

  try {
    log.info("http", "server", "Connecting to the server");
    // 👇🏻 We can use the url of the server
    await server.listen({
      port,
      host: httpConfig("host"),
    });

    const baseUrl = config.get("app.baseUrl");

    // update base url
    setBaseUrl(baseUrl);

    log.success("http", "server", `Server is listening on ${baseUrl}`);
  } catch (error) {
    log.error("http", "server", error);

    process.exit(1); // stop the process, exit with error
  }
}

export async function stopHttpApplication() {
  log.info("http", "server", "Stopping the server");
  const server = getServer();

  await server?.close();

  log.success("http", "server", "Server is stopped");
}
