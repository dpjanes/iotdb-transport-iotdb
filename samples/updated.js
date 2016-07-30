/*
 *  updated.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-07-30
 */

const transporter = require("../transporter");
const _ = require("iotdb")._;

const testers = require("iotdb-transport").testers;

const make = require("./make");
const transport = make.transport;

make.on_one(() => {
    testers.updated(transport);
});
