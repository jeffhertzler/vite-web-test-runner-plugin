const vite = require("vite");
const fetch = require("cross-fetch");

const WDS_FILE_PREFIX = "__web-dev-server__";
const WTR_FILE_PREFIX = "__web-test-runner__";

/**
 * @param {{ skipVite?: (url: string) => boolean }} opts
 */
module.exports = function (opts) {
  /** @type { import('vite').ViteDevServer } */
  let viteServer;

  /** @type {import('@web/test-runner').TestRunnerPlugin } */
  const plugin = {
    name: "vite-plugin",

    async serverStart({ app, config }) {
      viteServer = await vite.createServer({
        clearScreen: false,
        logLevel: "error",
        resolve: {
          // if vite sees an import for a wtr generated path, fetch the path from wtr
          alias: [
            {
              find: new RegExp(`\/(${WDS_FILE_PREFIX}|${WTR_FILE_PREFIX}.*)`),
              replacement: `http://${config.hostname}:${config.port}/$1`,
            },
          ],
        },
      });
      await viteServer.listen();

      const port = viteServer.config.server.port;
      const protocol = viteServer.config.server.https ? "https" : "http";
      app.use(async (ctx, next) => {
        const { originalUrl, path, querystring } = ctx;
        const querySep = querystring?.length ? "?" : "";

        if (typeof opts.skipVite === "function") {
          if (opts.skipVite(originalUrl)) return next();
        }

        const viteUrl = `${protocol}://localhost:${port}${path}${querySep}${querystring}`;

        const resp = await fetch(viteUrl);
        const headers = Object.fromEntries(resp.headers.entries());

        ctx.response.body = resp.body;
        ctx.response.set(headers);
      });
    },

    async serverStop() {
      return viteServer.close();
    },
  };
  return plugin;
};
