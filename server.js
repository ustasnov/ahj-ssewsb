/* eslint-env node */

const http = require("http");
const Koa = require("koa");
const koaBody = require("koa-body");
const WS = require("ws");

const app = new Koa();
const router = require("./routes");

app.use(
  koaBody({
    urlencoded: true,
    //multipart: true,
  })
);

app.use((ctx, next) => {
  if (ctx.request.method !== "OPTIONS") {
    next();

    return;
  }

  ctx.response.set("Access-Control-Allow-Origin", "*");
  ctx.response.set(
    "Access-Control-Allow-Methods",
    "DELETE, PUT, PATCH, GET, POST"
  );
  ctx.response.set("Access-Control-Allow-Headers", "Content-Type");
  ctx.response.set("Content-Type", "application/json; charset=utf-8");

  ctx.response.status = 204;
});

app.use(router());

const server = http.createServer(app.callback());

const wsServer = new WS.Server({
  server,
});

wsServer.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log([...wsServer.clients]);
    const data = JSON.parse(message);
    if (data.command === "login") {
      console.log(`command: ${data.command}, alias: ${data.name}`);
      const res = JSON.stringify({ result: 1 });
      ws.send(res);
    }
  });
});

const port = 7070;
server.listen(port, (err) => {
  if (err) {
    console.log("Error occured:", err);
    return;
  }
  console.log(`server is listening on ${port}`);
});
