/* eslint-env node */

const http = require("http");
const WS = require("ws");
const controller = require("./src/controller");

const server = http.createServer();
const wsServer = new WS.Server({
  server,
});

wsServer.on("connection", (ws) => {
  ws.on("message", (message) => {
    controller.process(ws, "message", message);
  });

  ws.on("close", () => {
    controller.process(ws, "close", null);
  });
});

const port = 10000;
server.listen(port, (err) => {
  if (err) {
    console.log("Error occured:", err);
    return;
  }
  console.log(`server is listening on ${port}`);
});
