/* eslint-env node */

const fs = require("fs");
const uuid = require("uuid");
const Router = require("koa-router");
const router = new Router();

let tickets = [];

const dataFileName = "./public/data.json";

(() => {
  loadData();
})();

function saveData() {
  const stringData = JSON.stringify(tickets);
  fs.writeFileSync(
    dataFileName,
    stringData,
    (err) => {
      if (err) {
        throw new Error(`Error occured: ${err}`);
      }
    },
    { encoding: "utf8", flag: "w" }
  );
  console.log("data save to file");
}

function loadData() {
  const stringData = fs.readFileSync(dataFileName, {
    encoding: "utf8",
    flag: "r",
  });
  tickets = JSON.parse(stringData);
  console.log("data load from file");
}

function getCurrentDateString() {
  const options = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  const currentDate = new Date();
  return currentDate.toLocaleString("ru", options).replace(",", "");
}

router.get("/allTickets", (ctx) => {
  ctx.response.set("Access-Control-Allow-Origin", "*");
  console.log("Method = allTickets");

  loadData();
  ctx.response.body = { result: 0, data: tickets };
});

router.get("/ticketById/:id", (ctx) => {
  const { id } = ctx.params;
  console.log(`Method = ticketById, param: id = ${id}`);

  ctx.response.set("Access-Control-Allow-Origin", "*");

  const ticket = Array.from(tickets).find((e) => e.id === id);
  if (ticket) {
    ctx.response.body = { result: 0, data: ticket };
  } else {
    console.log(`ticket with id = ${id} not found`);
    ctx.response.body = { result: 1, data: {} };
  }
});

router.post("/createTicket", (ctx) => {
  console.log(ctx.request.body);

  ctx.response.set("Access-Control-Allow-Origin", "*");

  const ticket = {
    id: uuid.v4(),
    name: ctx.request.body.name,
    description: ctx.request.body.description,
    status: 0,
    created: getCurrentDateString(),
  };
  tickets.push(ticket);
  saveData();
  ctx.response.body = { result: 0, data: ticket };
});

router.post("/updateTicket", (ctx) => {
  const { id, name, description, status } = ctx.request.body;
  console.log(
    `id: ${id}, name: ${ctx.request.body.name}, description: ${ctx.request.body.description}, status: ${status}`
  );

  ctx.response.set("Access-Control-Allow-Origin", "*");

  const ticket = Array.from(tickets).find((el) => el.id === id);
  if (ticket) {
    ticket.name = name;
    ticket.description = description;
    ticket.status = status;
    saveData();
    ctx.response.body = { result: 0, data: ticket };
  } else {
    console.log(`ticket with id = ${id} not found`);
    ctx.response.body = { result: 1, data: {} };
  }
});

router.post("/toggleTicketStatus", (ctx) => {
  const { id } = ctx.request.body;
  console.log(`Method: toggleTicketStatus, param: id= ${id}`);

  ctx.response.set("Access-Control-Allow-Origin", "*");

  const ticket = Array.from(tickets).find((el) => el.id === id);
  if (ticket) {
    ticket.status = ticket.status === 0 ? 1 : 0;
    saveData();
    ctx.response.body = { result: 0, data: ticket };
  } else {
    console.log(`ticket with id = ${ctx.request.body.id} not found`);
    ctx.response.body = { result: 1, data: {} };
  }
});

router.delete("/deleteTicket/:id", (ctx) => {
  const { id } = ctx.params;
  console.log(`Method = deleteTicket, param: id = ${id}`);

  ctx.response.set("Access-Control-Allow-Origin", "*");

  const ticket = Array.from(tickets).find((e) => e.id === id);
  if (ticket) {
    tickets.splice(tickets.indexOf(ticket), 1);
    saveData();
  } else {
    console.log(`ticket for delete with id = ${id} not found`);
  }
  ctx.response.body = { result: 0, data: id };
});

module.exports = router;
