/* eslint-env node */

const http = require("http");
const Koa = require("koa");
const koaBody = require("koa-body");
const WS = require("ws");

const app = new Koa();
const router = require("./routes");

const users = [];
const chat = [];

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

function getPostDateString() {
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const currentDate = new Date();
  const datetime = currentDate.toLocaleString("ru", options).replace(",", "");
  const date = datetime.slice(0, 10);
  const time = datetime.slice(11);
  return `${time} ${date}`;
}

wsServer.on("connection", (ws) => {
  ws.on("message", (message) => {
    let resData = null;
    const data = JSON.parse(message);
    console.log(`command: ${data.command}, data: ${data.data}`);
    switch (data.command) {
      case "login": {
        if (users.indexOf(data.data) === -1) {
          users.push({ ws: ws, user: data.data });
          data.result = 0;
          console.log(`register in chat user: ${data.data}`);
        } else {
          data.result = 1;
          console.log(`user: ${data.data} already registered in chat`);
        }

        const res = JSON.stringify(data);
        ws.send(res);

        break;
      }
      case "post": {
        const { user, message } = data.data.data;
        console.log("recieve post:");
        console.log(data.data);
        const datetime = getPostDateString();
        const newPost = { datetime: datetime, user: user, message: message };
        chat.push(newPost);
        console.log(`add message to chat:`);
        console.log(newPost);

        resData = JSON.stringify({ command: "chat", data: chat });
        Array.from(wsServer.clients).forEach((ws) => {
          ws.send(resData);
        });
        console.log("send chat to clients:");
        //console.log(resData);

        break;
      }
      case "getusers": {
        const usersArr = Array.from(users).map((val) => {
          return val.user;
        });
        console.log(`send users to clients: ${usersArr}`);
        resData = JSON.stringify({ command: "users", data: usersArr });
        Array.from(users).forEach(el => el.ws.send(resData));
        
        break;
      }
      case "getchat": {
        resData = JSON.stringify({ command: "chat", data: chat });
        Array.from(wsServer.clients).forEach((ws) => {
          ws.send(resData);
        });
        console.log("send chat to clients:");
        //console.log(resData);
        
        break;
      }
      default:
        break;
    }
  });
  ws.on("close", () => {
    const deletedUser = Array.from(users).find(el => el.ws === ws);
    if (deletedUser) {
      users.splice(users.indexOf(deletedUser), 1);  
    };

    const usersArr = Array.from(users).map((val) => {
      return val.user;
    });
    console.log(`send users to clients: ${usersArr}`);
    resData = JSON.stringify({ command: "users", data: usersArr });
    Array.from(users).forEach(el => el.ws.send(resData));
    console.log(`clients count: ${users.length}`);
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
