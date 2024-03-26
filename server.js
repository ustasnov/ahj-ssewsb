/* eslint-env node */

const http = require("http");
const Koa = require("koa");
const koaBody = require("koa-body");
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

const port = 7070;
server.listen(port, (err) => {
  if (err) {
    console.log("Error occured:", err);
    return;
  }
  console.log(`server is listening on ${port}`);
});
