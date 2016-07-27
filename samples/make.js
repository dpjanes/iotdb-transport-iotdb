/*
 *  make.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-07-27
 */

const path = require("path");

const iotdb = require("iotdb")
iotdb.use("homestar-wemo")
iotdb.connect("WeMoSocket")

const transporter = require("../transporter");
const transport = transporter.make(iotdb.things());

exports.transport = transport;
