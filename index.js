const vite = require("vite");

const WDS_FILE_PREFIX = "/__web-dev-server__";
const WTR_FILE_PREFIX = "/__web-test-runner__";

module.exports = function () {
  let viteServer;

  return {
    name: "vite-plugin",

    async serverStart({ app, config }) {
      viteServer = await vite.createServer({
        clearScreen: false,
        resolve: {
          // if vite sees an import for a wtr generated file, it should fetch from wtr
          alias: [
            {
              find: new RegExp(`(${WDS_FILE_PREFIX}|${WTR_FILE_PREFIX}.*)`),
              replacement: `http://${config.hostname}:${config.port}$1`,
            },
          ],
        },
      });
      await viteServer.listen();
      const port = viteServer.config.server.port;
      const protocol = viteServer.config.server.https ? "https" : "http";
      app.use((ctx, next) => {
        const { path, querystring } = ctx;
        console.log("vite-wtr app.use path:", path);
        // redirect all requests except those for wtr generated files to the vite server
        if (wtrFile(path)) {
          // I think this is unnecessary, wtr handles these requests
          console.log("vite-wtr | serving locally:", path);
        } else {
          const querySep = querystring?.length ? "?" : "";
          const viteUrl = `${protocol}://localhost:${port}${path}${querySep}${querystring}`;
          console.log("vite-wtr | redirecting to:", viteUrl);
          ctx.redirect(viteUrl);
        }
        next();
      });
    },

    async serverStop() {
      return viteServer.close();
    },

    async serve(context) {
      console.log("vite-wtr serve:", context.path);
    },
  };
};

/** serve thes files  */
function wtrFile(url) {
  return url.startsWith(WDS_FILE_PREFIX) || url.startsWith(WTR_FILE_PREFIX);
}
