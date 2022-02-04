const vite = require("vite");

module.exports = function () {
  let server;

  return {
    name: "vite-plugin",

    async serverStart({ app, server, config }) {
      console.log("app", app);
      console.log("server", server);
      console.log("config", config);
      server = await vite.createServer({
        clearScreen: false,
        resolve: {
          alias: [
            {
              find: "/__web-dev-server__web-socket.js",
              replacement:
                "http://localhost:8000/__web-dev-server__web-socket.js",
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
