/*
 *  put_bands.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-07-24
 */

const transporter = require("../transporter");
const _ = require("iotdb")._;

const testers = require("iotdb-transport").testers;

const transport = require("./make").transport;
testers.put(transport, { band: "meta" });
testers.put(transport, { band: "model" });
testers.put(transport, { band: "istate" });
testers.bands(transport);
