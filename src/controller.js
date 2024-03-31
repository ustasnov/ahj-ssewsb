/* eslint-env node */

const model = require("./model");

class Controller {
  constructor() {
    this.model = model;
  }

  broadcast(command, data) {
    const users = this.model.users;
    const resData = JSON.stringify({ command: command, data: data });
    Array.from(users).forEach((el) => el.ws.send(resData));
    console.log(`send ${command} to clients`);
  }

  sendUsers() {
    const users = this.model.getUsers();
    this.broadcast("users", users);
  }

  sendChat() {
    const chat = this.model.getChat();
    this.broadcast("chat", chat);
  }

  process(ws, event, data) {
    switch (event) {
      case "message": {
        const reqData = JSON.parse(data);
        console.log(`command: ${reqData.command}`);
        switch (reqData.command) {
          case "login": {
            reqData.result = this.model.addUser(ws, reqData.data);
            const resData = JSON.stringify(reqData);
            ws.send(resData);
            break;
          }
          case "post": {
            this.model.addPost(reqData.data);
            this.sendChat();
            break;
          }
          case "getusers": {
            this.sendUsers();
            break;
          }
          case "getchat": {
            this.sendChat();
            break;
          }
          default:
            break;
        }
        break;
      }
      case "close": {
        this.model.deleteUser(ws);
        this.sendUsers();
        break;
      }
      default:
        break;
    }
  }
}

const controller = new Controller();
module.exports = controller;
