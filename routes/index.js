/* eslint-env node */

const combineRouters = require("koa-combine-routers");

const ticket = require("./ticket");

const router = combineRouters(ticket);

module.exports = router;
