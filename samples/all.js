/*
 *  all.js
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
testers.put(transport, { id: "ThingB", band: "istate" });
testers.put(transport, { id: "ThingB", band: "ostate" });
testers.all(transport);
