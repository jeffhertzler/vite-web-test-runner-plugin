const vite = require("vite");

const WDS_FILE_PREFIX = "__web-dev-server__";
const WTR_FILE_PREFIX = "__web-test-runner__";

module.exports = function () {
  let server;

  return {
    name: "vite-plugin",

    async serverStart({ app, server, config }) {
      server = await vite.createServer({
        clearScreen: false,
        resolve: {
          alias: [
            {
              find: new RegExp(`\/(${WDS_FILE_PREFIX}|${WTR_FILE_PREFIX}.*)`),
              replacement: `http://${config.hostname}:${config.port}/$1`,
            },
          ],
        },
      });
      await server.listen();
      const port = server.config.server.port;
      const protocol = server.config.server.https ? "https" : "http";
      app.use((ctx, next) => {
        ctx.redirect(`${protocol}://localhost:${port}${ctx.originalUrl}`);
        return;
      });
    },

    async serverStop() {
      return server.close();
    },
  };
};
