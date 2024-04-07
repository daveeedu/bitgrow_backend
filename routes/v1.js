const api = require("express")();
const { route } = H;

api.use("/auth", route("account"));
api.use("/user", route("user"));
api.use("/platform", route("platform"));
api.use("/bank", route("bank"));


module.exports = api;