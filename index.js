/*jslint node: true */
// jshint esversion:8
"use strict";

const cors = require("cors");
const { Server } = require("socket.io");
const { createServer } = require("http");
const fs = require("fs");
const config = require("./configs/config");
const path = require("path");

global.logger = require("./logger");
const logger = global.logger;
const app = require("./configs/express");

app.use(
  cors({
    origin: ["https://www.bitgrowinvestment.com", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// console.log({ msg2s: "Mine is ready", app });
// console.log({ msg23: "Mine is ready", logger, global });

logger.info("Logger is ready");
console.log({ msg3: "Mine is ready" });

const options = {
  key: fs.readFileSync(path.resolve(config.server_key)),
  cert: fs.readFileSync(path.resolve(config.server_cert)),
};
console.log({ msg4: "Mine is ready" });
// create express app using http servers
const server = createServer(options, app);
console.log({ msg5: "Mine is ready" });

/** Create socket connection */

global.io = new Server(server, {
  cors: {
    origin: "*",
  },
  serveClient: false,
  // transports: ['polling', 'websocket'],
  // allowEIO3: true,
});
console.log({ msg6: "Mine is ready" });

let users = [];

global.io.engine.on("connection_error", (err) => {
  logger.error("socket_connection_error", err);
});
console.log({ msg7: "Mine is ready" });

global.io.on("connection", (client) => {
  logger.info("connected", client.id);
  // event fired when the chat room is disconnected
  client.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== client.id);
    logger.warn("disconnect", users);
  });

  // add identity of user mapped to the socket id
  client.on("identity", (userId) => {
    users.push({
      socketId: client.id,
      userId: userId,
    });

    logger.info("identity", users);
  });

  // subscribe person to chat & other user as well
  client.on("subscribe", (roomId, otherUserId = "") => {
    client.join(roomId);
    logger.info("subscribe", [roomId, otherUserId, users]);
  });

  // mute a chat room
  client.on("unsubscribe", (roomId) => {
    client.leave(roomId);
  });
});

const port = app.get("port");
server.listen(port, () => {
  logger.info(`Server started on port ${port} 🚀`);
});
const express = require("express");
