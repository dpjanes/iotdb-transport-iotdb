/*
 *  put_list.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-07-24
 */

const transporter = require("../transporter");
const _ = require("iotdb")._;

const testers = require("iotdb-transport").testers;

const transport = require("./make").transport;
testers.put(transport, { id: "ThingA" });
testers.put(transport, { id: "ThingB" });
testers.list(transport);
