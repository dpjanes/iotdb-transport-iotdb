/*
 *  put_updated.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-07-24
 */

const transporter = require("../transporter");
const _ = require("iotdb")._;

const testers = require("iotdb-transport").testers;

const transport = require("./make").transport;
setInterval(() => testers.put(transport), 2000);

testers.updated(transport, { id: "MyThingID" });
//testers.updated(transport, { id: "DoesNotExist" });
