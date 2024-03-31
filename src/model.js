/* eslint-env node */

const fs = require("fs");

class Model {
  constructor() {
    this.chatFileName = "./public/chat.json";
    this.users = [];
    this.chat = [];

    try {
      if (fs.existsSync(this.chatFileName)) {
        this.loadChat();
      } else {
        this.saveChat();
      }
    } catch (err) {
      console.error(err);
    }
  }

  getPostDateString() {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const currentDate = new Date();
    const datetime = currentDate.toLocaleString("ru", options).replace(",", "");
    return `${datetime.slice(11)} ${datetime.slice(0, 10)}`;
  }

  getUsers() {
    return Array.from(this.users).map((val) => {
      return val.user;
    });
  }

  getChat() {
    return this.chat;
  }

  addUser(ws, user) {
    let result = 0;
    const foundUser = Array.from(this.users).find((el) => el.user === user);
    if (foundUser) {
      result = 1;
      console.log(`user: ${user} already registered in chat`);
    } else {
      this.users.push({ ws: ws, user: user });
      console.log(`register in chat user: ${user}`);
    }
    return result;
  }

  addPost(reqData) {
    const { user, message } = reqData.data;
    const datetime = this.getPostDateString();
    const newPost = { datetime: datetime, user: user, message: message };
    this.chat.push(newPost);
    console.log(`add message to chat`);
    this.saveChat();
  }

  deleteUser(ws) {
    const deletedUser = Array.from(this.users).find((el) => el.ws === ws);
    if (deletedUser) {
      this.users.splice(this.users.indexOf(deletedUser), 1);
      console.log(`delete user: ${deletedUser.user}`);
      return true;
    }
    console.log("user connection not found");
    return false;
  }

  saveChat() {
    const stringData = JSON.stringify(this.chat);
    fs.writeFileSync(
      this.chatFileName,
      stringData,
      (err) => {
        if (err) {
          throw new Error(`Error occured: ${err}`);
        }
      },
      { encoding: "utf8", flag: "w" }
    );
    console.log("chat save to file");
  }

  loadChat() {
    const stringData = fs.readFileSync(this.chatFileName, {
      encoding: "utf8",
      flag: "r",
    });
    this.chat = JSON.parse(stringData);
    console.log("chat load from file");
  }
}

const model = new Model();
module.exports = model;
