const vite = require("vite");

const WDS_FILE_PREFIX = "__web-dev-server__";
const WTR_FILE_PREFIX = "__web-test-runner__";

module.exports = function () {
  let viteServer;

  return {
    name: "vite-plugin",

    async serverStart({ app, config }) {
      viteServer = await vite.createServer({
        clearScreen: false,
        logLevel: 'error',
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
      app.use((ctx, next) => {
        const { path, querystring } = ctx;
        // redirect all requests except those for wtr generated files to the vite server
        const querySep = querystring?.length ? "?" : "";
        const viteUrl = `${protocol}://localhost:${port}${path}${querySep}${querystring}`;
        ctx.redirect(viteUrl);
        next();
      });
    },

    async serverStop() {
      return viteServer.close();
    },
  };
};
